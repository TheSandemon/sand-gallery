import { describe, it, expect } from 'vitest';
import { generateTrack } from '../src/track.js';
import { createWorld } from '../src/physics.js';

describe('Track', () => {
  it('generates track with same seed', () => {
    const world = createWorld();
    const track1 = generateTrack(world, { seed: 12345 });
    const track2 = generateTrack(world, { seed: 12345 });
    
    expect(track1.metadata.seed).toBe(track2.metadata.seed);
    expect(track1.metadata.numSegments).toBe(track2.metadata.numSegments);
  });
  
  it('generates different tracks with different seeds', () => {
    const world = createWorld();
    const track1 = generateTrack(world, { seed: 12345 });
    const track2 = generateTrack(world, { seed: 67890 });
    
    expect(track1.metadata.seed).not.toBe(track2.metadata.seed);
  });
  
  it('track has collision bodies', () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    
    expect(track.surfaceMeshes.length).toBeGreaterThan(0);
    expect(track.wallBodies.length).toBeGreaterThan(0);
  });
  
  it('track has race line', () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    
    expect(track.raceLine).toBeDefined();
    expect(track.raceLine.length).toBeGreaterThan(0);
    expect(track.spline).toBeDefined();
  });
  
  it('start point is defined', () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    
    expect(track.metadata.startPoint).toBeDefined();
    expect(track.metadata.startTangent).toBeDefined();
  });
});
