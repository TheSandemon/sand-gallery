import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { getLookAheadPoint } from './utils/spline.js';

const BALL_RADIUS = 0.5;

const BALL_COLORS = [0xff3333, 0x3333ff, 0xffcc00, 0x33cc33, 0xff6600, 0x9933ff];
const BALL_PREFIXES = ['Crimson', 'Azure', 'Golden', 'Emerald', 'Solar', 'Phantom'];
const BALL_SUFFIXES = ['Drift', 'Flash', 'Apex', 'Bolt', 'Surge', 'Racer'];

function generateBallName(index, seed) {
  const prefix = BALL_PREFIXES[(index + Math.floor(seed * 10)) % BALL_PREFIXES.length];
  const suffix = BALL_SUFFIXES[(index + Math.floor(seed * 7)) % BALL_SUFFIXES.length];
  return `${prefix} ${suffix}`;
}

function generateAIParams(seed, index) {
  const rng = (n) => {
    const s = seed + index * 100 + n * 7;
    return s - Math.floor(s);
  };
  
  return {
    topSpeed: 8 + rng(1) * 6,      // 8-14
    acceleration: 4 + rng(2) * 4,  // 4-8
    cornering: 4 + rng(3) * 4,     // 4-8
    aggression: 3 + rng(4) * 5     // 3-8
  };
}

export function createBall(world, options = {}) {
  const { name, color, mass = 1, aiParams, startPosition, startQuaternion, radius = BALL_RADIUS } = options;
  
  // Physics body
  const shape = new CANNON.Sphere(radius);
  const material = new CANNON.Material({ friction: 0.8, restitution: 0.3 });
  const body = new CANNON.Body({ mass, material });
  body.addShape(shape);
  body.position.set(startPosition.x, startPosition.y, startPosition.z);
  if (startQuaternion) {
    body.quaternion.set(startQuaternion.x, startQuaternion.y, startQuaternion.z, startQuaternion.w);
  }
  body.linearDamping = 0.3;
  body.angularDamping = 0.3;
  world.addBody(body);
  
  // Visual mesh
  const geometry = new THREE.SphereGeometry(radius, 24, 24);
  const meshColor = color || BALL_COLORS[Math.abs(hashCode(name || 'ball')) % BALL_COLORS.length];
  const material3d = new THREE.MeshStandardMaterial({
    color: meshColor,
    roughness: 0.3,
    metalness: 0.7,
    emissive: meshColor,
    emissiveIntensity: 0.2
  });
  const mesh = new THREE.Mesh(geometry, material3d);
  
  return {
    body,
    mesh,
    name: name || 'Ball',
    aiParams,
    radius,
    currentSegmentT: 0,
    distanceTraveled: 0
  };
}

export function createBalls(world, count = 3, startPosition, startTangent, seed = Date.now()) {
  const balls = [];
  const rng = createSeededRandom(seed);
  
  // Stagger start positions
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(startTangent.x, 0, startTangent.z).normalize(), new THREE.Vector3(0, 1, 0)).normalize();
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const offset = right.clone().multiplyScalar((t - 0.5) * 4); // Spread balls across track width
    const position = new THREE.Vector3(
      startPosition.x + offset.x,
      startPosition.y + 1, // Lift above track surface
      startPosition.z + offset.z
    );
    
    const aiParams = generateAIParams(seed + i, i);
    const ball = createBall(world, {
      name: generateBallName(i, seed),
      color: BALL_COLORS[i % BALL_COLORS.length],
      aiParams,
      startPosition: { x: position.x, y: position.y, z: position.z },
      startQuaternion: { x: 0, y: 0, z: 0, w: 1 }
    });
    
    balls.push(ball);
  }
  
  return balls;
}

export function updateBallAI(ball, track, dt) {
  const pos = ball.body.position;
  const position = new THREE.Vector3(pos.x, pos.y, pos.z);
  
  // Find closest point on race line
  let minDist = Infinity;
  let closestT = ball.currentSegmentT;
  
  for (let t = Math.max(0, ball.currentSegmentT - 0.05); t < Math.min(1, ball.currentSegmentT + 0.1); t += 0.005) {
    const pt = track.spline.getPoint(t);
    const dist = position.distanceTo(pt);
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }
  
  ball.currentSegmentT = closestT;
  
  // Look-ahead point
  const lookAhead = getLookAheadPoint(track.spline, closestT, ball.aiParams.topSpeed * 0.5);
  
  // Direction to look-ahead
  const toTarget = new THREE.Vector3().subVectors(lookAhead, position);
  toTarget.y = 0;
  const targetDist = toTarget.length();
  toTarget.normalize();
  
  // Current velocity
  const vel = ball.body.velocity;
  const currentVel = new THREE.Vector3(vel.x, vel.y, vel.z);
  const currentSpeed = currentVel.length();
  currentVel.y = 0;
  if (currentVel.length() > 0) currentVel.normalize();
  
  // Steering
  const steerStrength = ball.aiParams.cornering / 8;
  const currentDir = currentSpeed > 0.1 ? currentVel : new THREE.Vector3(track.startTangent.x, 0, track.startTangent.z).normalize();
  const steer = new THREE.Vector3().lerpVectors(currentDir, toTarget, steerStrength * dt * 3).normalize();
  
  // Throttle
  const speedRatio = currentSpeed / ball.aiParams.topSpeed;
  let throttle = 1.0;
  if (speedRatio > 0.8) throttle = 0.3;
  else if (speedRatio > 0.95) throttle = 0;
  
  // Apply steering and throttle
  const accel = ball.aiParams.acceleration * throttle;
  const force = steer.multiplyScalar(accel / 50); // Scale down for reasonable force
  
  ball.body.applyForce(new CANNON.Vec3(force.x, 0, force.z));
  
  // Add slight vertical bounce for realism
  if (position.y < track.startPoint.y + 1 && ball.body.velocity.y < 0.1) {
    ball.body.applyForce(new CANNON.Vec3(0, 3, 0));
  }
  
  // Sync mesh to body
  ball.mesh.position.copy(ball.body.position);
  ball.mesh.quaternion.copy(ball.body.quaternion);
}

function createSeededRandom(seed) {
  let s = seed;
  return () => {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
