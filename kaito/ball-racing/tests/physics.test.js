import { describe, it, expect } from 'vitest';
import { createWorld, addGround, stepWorld, checkForNaN } from '../src/physics.js';
import * as CANNON from 'cannon-es';

describe('Physics', () => {
  it('creates world with correct gravity', () => {
    const world = createWorld();
    expect(world.gravity.y).toBe(-9.81);
  });
  
  it('adds ground plane', () => {
    const world = createWorld();
    const ground = addGround(world);
    expect(ground).toBeDefined();
    expect(ground.mass).toBe(0);
  });
  
  it('steps without NaN', () => {
    const world = createWorld();
    const ground = addGround(world);
    
    const sphere = new CANNON.Body({ mass: 1 });
    sphere.addShape(new CANNON.Sphere(0.5));
    sphere.position.set(0, 10, 0);
    world.addBody(sphere);
    
    for (let i = 0; i < 100; i++) {
      stepWorld(world, 1/60);
    }
    
    expect(checkForNaN(sphere)).toBe(false);
    expect(isFinite(sphere.position.y)).toBe(true);
  });
  
  it('bodies collide with ground', () => {
    const world = createWorld();
    addGround(world);
    
    const sphere = new CANNON.Body({ mass: 1 });
    sphere.addShape(new CANNON.Sphere(0.5));
    sphere.position.set(0, 5, 0);
    world.addBody(sphere);
    
    for (let i = 0; i < 60; i++) {
      stepWorld(world, 1/60);
    }
    
    // Ball should have fallen and settled
    expect(sphere.position.y).toBeLessThan(5);
    expect(sphere.position.y).toBeGreaterThan(0);
  });
});
