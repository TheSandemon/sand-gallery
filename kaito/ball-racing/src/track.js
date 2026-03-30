import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createCatmullRomSpline, getClosestPointOnSpline } from './utils/spline.js';
import { createSeededRandom } from './utils/noise.js';

const TRACK_WIDTH = 8;
const TRACK_SEGMENT_LENGTH = 2;
const WALL_HEIGHT = 1.5;
const FINISH_LINE_WIDTH = TRACK_WIDTH;
const FINISH_LINE_DEPTH = 0.5;

export function generateTrack(world, options = {}) {
  const { seed = Date.now(), length = 400, width = TRACK_WIDTH } = options;
  const rng = createSeededRandom(seed);
  
  // Generate control points
  const numPoints = 8 + Math.floor(rng() * 8); // 8-16 points
  const controlPoints = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const baseRadius = 30 + rng() * 40;
    const x = Math.cos(angle) * baseRadius + (rng() - 0.5) * 20;
    const z = Math.sin(angle) * baseRadius + (rng() - 0.5) * 20;
    const y = rng() * 10; // elevation variation
    controlPoints.push({ x, y, z });
  }
  
  // Create spline
  const spline = createCatmullRomSpline(controlPoints, true, 200);
  const totalLength = spline.getLength();
  
  // Generate track surface meshes and physics bodies
  const surfaceMeshes = [];
  const wallBodies = [];
  
  const numSegments = Math.floor(totalLength / TRACK_SEGMENT_LENGTH);
  
  for (let i = 0; i < numSegments; i++) {
    const t1 = i / numSegments;
    const t2 = (i + 1) / numSegments;
    
    const p1 = spline.getPoint(t1);
    const p2 = spline.getPoint(t2);
    const tangent = spline.getTangent(t1);
    
    // Calculate perpendicular for width
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    
    // Create track segment quad
    const halfWidth = width / 2;
    const segmentLength = p1.distanceTo(p2);
    
    const vertices = [
      p1.clone().add(right.clone().multiplyScalar(-halfWidth)),
      p1.clone().add(right.clone().multiplyScalar(halfWidth)),
      p2.clone().add(right.clone().multiplyScalar(halfWidth)),
      p2.clone().add(right.clone().multiplyScalar(-halfWidth))
    ];
    
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0].x, vertices[0].z);
    shape.lineTo(vertices[1].x, vertices[1].z);
    shape.lineTo(vertices[2].x, vertices[2].z);
    shape.lineTo(vertices[3].x, vertices[3].z);
    shape.closePath();
    
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: false
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, p1.y, 0);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    surfaceMeshes.push(mesh);
    
    // Physics body for track surface
    const trackShape = new CANNON.Box(new CANNON.Vec3(segmentLength / 2 + 0.5, 0.05, halfWidth - 0.1));
    const trackBody = new CANNON.Body({ mass: 0 });
    trackBody.addShape(trackShape);
    trackBody.position.set(
      (p1.x + p2.x) / 2,
      p1.y + 0.05,
      (p1.z + p2.z) / 2
    );
    // Align body with track direction
    const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
    trackBody.quaternion.setFromEuler(0, -angle, 0);
    world.addBody(trackBody);
    
    // Left wall
    const wallShape = new CANNON.Box(new CANNON.Vec3(segmentLength / 2 + 0.2, WALL_HEIGHT / 2, 0.1));
    const leftWallBody = new CANNON.Body({ mass: 0 });
    leftWallBody.addShape(wallShape);
    const leftOffset = right.clone().multiplyScalar(-halfWidth - 0.05);
    leftWallBody.position.set(
      (p1.x + p2.x) / 2 + leftOffset.x,
      p1.y + WALL_HEIGHT / 2,
      (p1.z + p2.z) / 2 + leftOffset.z
    );
    leftWallBody.quaternion.setFromEuler(0, -angle, 0);
    world.addBody(leftWallBody);
    wallBodies.push(leftWallBody);
    
    // Right wall
    const rightWallBody = new CANNON.Body({ mass: 0 });
    rightWallBody.addShape(wallShape);
    const rightOffset = right.clone().multiplyScalar(halfWidth + 0.05);
    rightWallBody.position.set(
      (p1.x + p2.x) / 2 + rightOffset.x,
      p1.y + WALL_HEIGHT / 2,
      (p1.z + p2.z) / 2 + rightOffset.z
    );
    rightWallBody.quaternion.setFromEuler(0, -angle, 0);
    world.addBody(rightWallBody);
    wallBodies.push(rightWallBody);
  }
  
  // Finish line
  const startPoint = spline.getPoint(0);
  const startTangent = spline.getTangent(0);
  const startUp = new THREE.Vector3(0, 1, 0);
  const startRight = new THREE.Vector3().crossVectors(startTangent, startUp).normalize();
  
  const finishGeometry = new THREE.PlaneGeometry(width, FINISH_LINE_DEPTH);
  const finishMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x004400,
    side: THREE.DoubleSide
  });
  const finishMesh = new THREE.Mesh(finishGeometry, finishMaterial);
  finishMesh.rotation.x = -Math.PI / 2;
  finishMesh.rotation.z = Math.atan2(startTangent.x, startTangent.z);
  finishMesh.position.set(startPoint.x, startPoint.y + 0.02, startPoint.z);
  surfaceMeshes.push(finishMesh);
  
  // Race line (center of track)
  const raceLine = [];
  for (let i = 0; i <= 200; i++) {
    raceLine.push(spline.getPoint(i / 200));
  }
  
  return {
    spline,
    surfaceMeshes,
    wallBodies,
    raceLine,
    metadata: {
      seed,
      length: totalLength,
      width,
      numSegments,
      startPoint,
      startTangent
    }
  };
}

export function getTrackProgress(track, position) {
  const result = getClosestPointOnSpline(track.spline, position, 200);
  return result.t;
}
