import { describe, it, expect } from 'vitest';
import { RaceController, RaceState } from '../src/race.js';
import { createWorld } from '../src/physics.js';
import { generateTrack } from '../src/track.js';
import { createBalls } from '../src/ball.js';

describe('Race', () => {
  it('starts in COUNTDOWN state', () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    const balls = createBalls(world, 3, track.metadata.startPoint, track.metadata.startTangent, 12345);
    
    const race = new RaceController();
    race.start(world, track, balls);
    
    expect(race.getState()).toBe(RaceState.COUNTDOWN);
  });
  
  it('transitions to RACING after countdown', async () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    const balls = createBalls(world, 3, track.metadata.startPoint, track.metadata.startTangent, 12345);
    
    const race = new RaceController();
    race.start(world, track, balls);
    
    // Wait for countdown
    await new Promise(r => setTimeout(r, 3500));
    
    expect(race.getState()).toBe(RaceState.RACING);
  });
  
  it('returns winner after finish', async () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    const balls = createBalls(world, 3, track.metadata.startPoint, track.metadata.startTangent, 12345);
    
    const race = new RaceController();
    race.start(world, track, balls);
    
    // Simulate until finished (up to 2 min max)
    let finished = false;
    const startTime = Date.now();
    
    while (!finished && Date.now() - startTime < 120000) {
      race.update(1/60);
      finished = race.getState() === RaceState.FINISHED;
    }
    
    expect(race.getState()).toBe(RaceState.FINISHED);
    expect(race.getWinner()).toBeDefined();
  });
  
  it('getPositions returns sorted balls', () => {
    const world = createWorld();
    const track = generateTrack(world, { seed: 12345 });
    const balls = createBalls(world, 3, track.metadata.startPoint, track.metadata.startTangent, 12345);
    
    const race = new RaceController();
    race.start(world, track, balls);
    
    const positions = race.getPositions();
    expect(positions.length).toBe(3);
    expect(positions[0].segmentT).toBeGreaterThanOrEqual(positions[1].segmentT);
  });
});
