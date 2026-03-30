import * as CANNON from 'cannon-es';

const GRAVITY = -9.81;
const FIXED_TIMESTEP = 1 / 60;
const SOLVER_ITERATIONS = 10;

export function createWorld() {
  const world = new CANNON.World();
  world.gravity.set(0, GRAVITY, 0);
  world.solver.iterations = SOLVER_ITERATIONS;
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  
  // Default contact material
  const defaultMaterial = new CANNON.Material('default');
  const defaultContact = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.7,
    restitution: 0.3
  });
  world.addContactMaterial(defaultContact);
  world.defaultContactMaterial = defaultContact;
  
  return world;
}

export function addGround(world) {
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0, material: new CANNON.Material('ground') });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);
  return groundBody;
}

export function addBoxBody(world, size, position, options = {}) {
  const { mass = 0, friction = 0.7, restitution = 0.3 } = options;
  const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
  const material = new CANNON.Material({ friction, restitution });
  const body = new CANNON.Body({ mass, material });
  body.addShape(shape);
  body.position.set(position.x, position.y, position.z);
  world.addBody(body);
  return body;
}

export function addStaticBody(world, shape, position, quaternion) {
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(shape);
  body.position.set(position.x, position.y, position.z);
  if (quaternion) {
    body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }
  world.addBody(body);
  return body;
}

export function stepWorld(world, dt) {
  world.step(FIXED_TIMESTEP, dt, 3);
}

export function checkForNaN(body) {
  const pos = body.position;
  const vel = body.velocity;
  if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z) ||
      isNaN(vel.x) || isNaN(vel.y) || isNaN(vel.z)) {
    return true;
  }
  return false;
}
