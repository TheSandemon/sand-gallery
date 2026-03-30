import * as THREE from 'three';
import { updateBallAI } from './ball.js';

const RaceState = {
  IDLE: 'IDLE',
  COUNTDOWN: 'COUNTDOWN',
  RACING: 'RACING',
  FINISHED: 'FINISHED'
};

const RACE_TIMEOUT = 120; // seconds

export class RaceController {
  constructor() {
    this.state = RaceState.IDLE;
    this.track = null;
    this.balls = [];
    this.world = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.winner = null;
    this.finishOrder = [];
    this.countdownDuration = 3;
    this.countdownStart = null;
  }
  
  start(world, track, balls) {
    this.world = world;
    this.track = track;
    this.balls = balls;
    this.state = RaceState.COUNTDOWN;
    this.countdownStart = Date.now();
    this.winner = null;
    this.finishOrder = [];
    
    // Reset ball positions
    const startPoint = track.metadata.startPoint;
    const startTangent = track.metadata.startTangent;
    const right = new THREE.Vector3().crossVectors(
      new THREE.Vector3(startTangent.x, 0, startTangent.z).normalize(),
      new THREE.Vector3(0, 1, 0)
    ).normalize();
    
    for (let i = 0; i < balls.length; i++) {
      const t = i / balls.length;
      const offset = right.clone().multiplyScalar((t - 0.5) * 4);
      balls[i].body.position.set(
        startPoint.x + offset.x,
        startPoint.y + 1,
        startPoint.z + offset.z
      );
      balls[i].body.velocity.set(0, 0, 0);
      balls[i].body.angularVelocity.set(0, 0, 0);
      balls[i].currentSegmentT = 0;
      balls[i].mesh.position.copy(balls[i].body.position);
    }
    
    return this;
  }
  
  update(dt) {
    if (this.state === RaceState.COUNTDOWN) {
      const elapsed = (Date.now() - this.countdownStart) / 1000;
      if (elapsed >= this.countdownDuration) {
        this.state = RaceState.RACING;
        this.startTime = Date.now();
      }
      return this.state;
    }
    
    if (this.state === RaceState.RACING) {
      this.elapsedTime = (Date.now() - this.startTime) / 1000;
      
      // Update physics
      this.world.step(1 / 60, dt, 3);
      
      // Update AI for each ball
      for (const ball of this.balls) {
        updateBallAI(ball, this.track, dt);
        
        // Check for finish (segmentT > 0.98 means near completion)
        if (ball.currentSegmentT > 0.98 && !this.finishOrder.includes(ball)) {
          this.finishOrder.push(ball);
        }
      }
      
      // Check for winner
      if (this.finishOrder.length > 0 && !this.winner) {
        this.winner = this.finishOrder[0];
        this.state = RaceState.FINISHED;
      }
      
      // Timeout check
      if (this.elapsedTime > RACE_TIMEOUT) {
        this.state = RaceState.FINISHED;
        if (!this.winner && this.finishOrder.length > 0) {
          this.winner = this.finishOrder[0];
        }
      }
      
      return this.state;
    }
    
    return this.state;
  }
  
  getState() {
    return this.state;
  }
  
  getElapsed() {
    if (this.state === RaceState.COUNTDOWN) {
      return 0;
    }
    return this.elapsedTime;
  }
  
  getCountdownRemaining() {
    if (this.state === RaceState.COUNTDOWN) {
      return Math.max(0, this.countdownDuration - (Date.now() - this.countdownStart) / 1000);
    }
    return 0;
  }
  
  getWinner() {
    return this.winner;
  }
  
  getFinishOrder() {
    return this.finishOrder;
  }
  
  getPositions() {
    return this.balls
      .map(ball => ({
        ball,
        segmentT: ball.currentSegmentT,
        position: ball.body.position,
        velocity: ball.body.velocity,
        speed: Math.sqrt(
          ball.body.velocity.x ** 2 +
          ball.body.velocity.y ** 2 +
          ball.body.velocity.z ** 2
        )
      }))
      .sort((a, b) => b.segmentT - a.segmentT);
  }
  
  getTrack() {
    return this.track;
  }
  
  getBalls() {
    return this.balls;
  }
}
