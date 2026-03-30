import { DOMParser } from '@xmldom/xmldom';
import * as THREE from 'three';
import { createWorld } from './physics.js';
import { generateTrack } from './track.js';
import { createBalls } from './ball.js';
import { RaceController } from './race.js';
import { CameraManager } from './cameras.js';
import { Renderer } from './render.js';
import { Recorder } from './recording.js';
import { createMarketPayload } from './market.js';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const RACE_OUTPUT_DIR = 'kaito/ball-racing/replays/';
const STATE_FILE = 'kaito/ball-racing/state.json';

let state = null;

async function loadState() {
  try {
    const data = await import('fs/promises').then(fs => fs.readFile(STATE_FILE, 'utf8'));
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveState(state) {
  const { writeFile: wf } = await import('fs/promises');
  await mkdir('kaito/ball-racing/', { recursive: true });
  await wf(STATE_FILE, JSON.stringify(state, null, 2));
}

async function runRace() {
  console.log('[BallRacing] Starting race...');
  
  // Load state
  state = await loadState();
  if (!state) {
    console.error('[BallRacing] No state file found');
    return;
  }
  
  state.status = 'running';
  await saveState(state);
  
  try {
    // Initialize
    const seed = Date.now();
    const trackSeed = seed;
    
    // Create physics world
    const world = createWorld();
    
    // Generate track
    const track = generateTrack(world, { seed: trackSeed, length: 400 });
    console.log(`[BallRacing] Track generated: ${track.metadata.numSegments} segments, length: ${track.metadata.length.toFixed(0)}`);
    
    // Create balls
    const startPoint = track.metadata.startPoint;
    const startTangent = track.metadata.startTangent;
    const balls = createBalls(world, 3, startPoint, startTangent, seed);
    console.log(`[BallRacing] Balls created: ${balls.map(b => b.name).join(', ')}`);
    
    // Create renderer
    const renderer = new Renderer();
    const { document } = await import('linkedom-shim');
    const { parseHTML } = document ? null : {};
    
    // For headless/CLI, we'll render to an off-screen canvas
    // Create a mock DOM environment
    const { setupGlobalDocument } = await import('./test/globa-dom-shim.js').catch(() => ({ setupGlobalDocument: null }));
    
    let canvas;
    
    // Try to use jsdom or a canvas shim
    try {
      // Use node-canvas for headless rendering
      const { createCanvas } = await import('canvas');
      canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');
      
      // We'll need Three.js to render to this canvas
      // This is complex - for now, use a simpler approach
      console.log('[BallRacing] Running in headless mode - video capture limited');
    } catch {
      // Fallback: create a basic canvas for Three.js
      canvas = null;
    }
    
    // Create Three.js renderer with headless support
    const threeRenderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      alpha: false
    });
    threeRenderer.setSize(1920, 1080);
    threeRenderer.setPixelRatio(1);
    threeRenderer.shadowMap.enabled = true;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 50, 200);
    
    // Lights
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    scene.add(sun);
    
    // Add track meshes to scene
    for (const mesh of track.surfaceMeshes) {
      scene.add(mesh);
    }
    
    // Add ball meshes to scene
    for (const ball of balls) {
      scene.add(ball.mesh);
      // Add glow effect
      const glowGeo = new THREE.SphereGeometry(ball.radius * 1.3, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: ball.mesh.material.color,
        transparent: true,
        opacity: 0.15
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      ball.mesh.add(glow);
    }
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, 1920 / 1080, 0.1, 1000);
    camera.position.set(0, 30, 50);
    camera.lookAt(0, 0, 0);
    
    // Camera manager
    const cameraManager = new CameraManager(threeRenderer);
    cameraManager.setFollowSubject(balls[0]);
    cameraManager.setFinishLine(
      new THREE.Vector3(startPoint.x, startPoint.y + 5, startPoint.z),
      new THREE.Vector3(0, 0, 0)
    );
    
    // Race controller
    const race = new RaceController();
    race.start(world, track, balls);
    
    // Setup recording
    let recorder = null;
    let recording = false;
    
    try {
      recorder = new Recorder(threeRenderer.domElement, { width: 1920, height: 1080, fps: 30 });
      await recorder.start();
      recording = true;
      console.log('[BallRacing] Recording started');
    } catch (e) {
      console.log('[BallRacing] Recording not available (headless mode):', e.message);
    }
    
    // Race loop
    const targetFPS = 60;
    const frameTime = 1 / targetFPS;
    let lastTime = Date.now();
    let frameCount = 0;
    const maxFrames = 60 * 120; // 2 minutes max
    
    console.log('[BallRacing] Race starting...');
    
    while (race.getState() !== 'FINISHED' && frameCount < maxFrames) {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      // Update race
      race.update(dt);
      
      // Update camera
      const raceState = { balls, track };
      const activeCamera = cameraManager.update(raceState, race.getElapsed());
      
      // Render
      threeRenderer.render(scene, activeCamera);
      
      frameCount++;
      
      // Small delay to not overwhelm CPU
      if (dt < frameTime) {
        await new Promise(r => setTimeout(r, (frameTime - dt) * 1000));
      }
      
      // Log progress every 5 seconds
      if (frameCount % (targetFPS * 5) === 0) {
        const elapsed = race.getElapsed();
        const positions = race.getPositions();
        console.log(`[BallRacing] ${elapsed.toFixed(1)}s - Leader: ${positions[0]?.ball.name} (${(positions[0]?.segmentT * 100).toFixed(1)}%)`);
      }
    }
    
    const winner = race.getWinner();
    console.log(`[BallRacing] Race finished! Winner: ${winner?.name || 'Unknown'}`);
    
    // Stop recording
    let replayBlob = null;
    let replayPath = null;
    
    if (recording && recorder) {
      try {
        replayBlob = await recorder.stop();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `race-${timestamp}-${trackSeed}.webm`;
        replayPath = `${RACE_OUTPUT_DIR}${filename}`;
        
        await mkdir(RACE_OUTPUT_DIR, { recursive: true });
        const buffer = await replayBlob.arrayBuffer();
        await writeFile(replayPath, Buffer.from(buffer));
        
        console.log(`[BallRacing] Replay saved: ${replayPath}`);
      } catch (e) {
        console.log('[BallRacing] Failed to save replay:', e.message);
      }
    }
    
    // Generate market payload
    const raceResult = {
      raceId: `race-${Date.now()}`,
      timestamp: new Date(),
      trackSeed,
      balls,
      winner,
      track,
      replayUrl: replayPath ? `https://replays.kaito.app/${replayPath.split('/').pop()}` : null
    };
    
    const { payload, filePath } = await createMarketPayload(raceResult);
    console.log(`[BallRacing] Market payload saved: ${filePath}`);
    
    // Update state
    state = await loadState();
    state.status = 'building';
    state.races.push({
      id: raceResult.raceId,
      timestamp: raceResult.timestamp.toISOString(),
      trackSeed,
      winner: winner?.name || null,
      replayPath,
      marketPayload: filePath,
      marketStatus: 'pending'
    });
    state.stats.racesCompleted++;
    await saveState(state);
    
    console.log('[BallRacing] Race complete!');
    console.log(`  Winner: ${winner?.name}`);
    console.log(`  Replay: ${replayPath}`);
    console.log(`  Market: ${filePath}`);
    
    return {
      winner,
      replayPath,
      marketPayload: payload
    };
    
  } catch (error) {
    console.error('[BallRacing] Error:', error);
    state = await loadState();
    state.status = 'error';
    await saveState(state);
    throw error;
  }
}

// Run if called directly
runRace().catch(console.error);

export { runRace };
