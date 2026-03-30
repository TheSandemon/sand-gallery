import * as THREE from 'three';

const CAMERA_TYPES = {
  FOLLOW: 'follow',
  FLY: 'fly',
  HELICAM: 'helicam',
  FINISHLINE: 'finishline',
  DRAMA: 'drama'
};

export class CameraManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.cameras = {};
    this.activeCamera = null;
    this.currentCameraName = 'follow';
    this.cutSchedule = [];
    this.lastCutTime = 0;
    this.cutInterval = 2; // seconds between auto-cuts
    
    this._initCameras();
  }
  
  _initCameras() {
    const aspect = 16 / 9;
    const w = this.renderer.getSize().width || 1920;
    const h = this.renderer.getSize().height || 1080;
    const currentAspect = w / h;
    
    // Follow camera
    this.cameras[CAMERA_TYPES.FOLLOW] = {
      type: CAMERA_TYPES.FOLLOW,
      camera: new THREE.PerspectiveCamera(60, currentAspect, 0.1, 1000),
      offset: new THREE.Vector3(0, 3, -8),
      target: null,
      subject: null
    };
    
    // Fly camera (wide sweeping shot)
    this.cameras[CAMERA_TYPES.FLY] = {
      type: CAMERA_TYPES.FLY,
      camera: new THREE.PerspectiveCamera(45, currentAspect, 0.1, 2000),
      angle: 0,
      radius: 80,
      height: 30,
      center: new THREE.Vector3(0, 0, 0)
    };
    
    // Helicam (orbit above)
    this.cameras[CAMERA_TYPES.HELICAM] = {
      type: CAMERA_TYPES.HELICAM,
      camera: new THREE.PerspectiveCamera(50, currentAspect, 0.1, 1500),
      orbitAngle: 0,
      orbitRadius: 60,
      orbitHeight: 40
    };
    
    // Finishline camera
    this.cameras[CAMERA_TYPES.FINISHLINE] = {
      type: CAMERA_TYPES.FINISHLINE,
      camera: new THREE.PerspectiveCamera(70, currentAspect, 0.1, 500),
      position: new THREE.Vector3(0, 5, 20),
      target: new THREE.Vector3(0, 0, 0)
    };
    
    // Drama camera (smart cuts)
    this.cameras[CAMERA_TYPES.DRAMA] = {
      type: CAMERA_TYPES.DRAMA,
      camera: new THREE.PerspectiveCamera(55, currentAspect, 0.1, 800),
      dramaticSubject: null,
      isActive: false
    };
    
    this.activeCamera = this.cameras[CAMERA_TYPES.FOLLOW].camera;
  }
  
  setFollowSubject(ball) {
    this.cameras[CAMERA_TYPES.FOLLOW].subject = ball;
  }
  
  setFinishLine(position, target) {
    this.cameras[CAMERA_TYPES.FINISHLINE].position = position.clone().add(new THREE.Vector3(0, 5, 15));
    this.cameras[CAMERA_TYPES.FINISHLINE].target = target;
  }
  
  update(raceState, elapsedTime) {
    const { balls, track } = raceState;
    
    // Auto-cut logic
    if (elapsedTime - this.lastCutTime > this.cutInterval) {
      this._autoCut(balls, elapsedTime);
      this.lastCutTime = elapsedTime;
    }
    
    // Update each camera type
    this._updateFollow(balls, track);
    this._updateFly(elapsedTime);
    this._updateHelicam(elapsedTime);
    this._updateFinishline();
    this._updateDrama(balls);
    
    return this.activeCamera;
  }
  
  _updateFollow(balls, track) {
    const cam = this.cameras[CAMERA_TYPES.FOLLOW];
    if (!cam.subject) {
      cam.subject = balls[0];
    }
    
    const pos = cam.subject.body.position;
    const vel = cam.subject.body.velocity;
    
    // Camera behind the ball, in direction of velocity
    const velDir = new THREE.Vector3(vel.x, 0, vel.z).normalize();
    const behindDir = new THREE.Vector3(-velDir.x, 0, -velDir.z);
    
    const camPos = new THREE.Vector3(pos.x, pos.y + 3, pos.z)
      .add(behindDir.multiplyScalar(8));
    
    cam.camera.position.copy(camPos);
    cam.camera.lookAt(pos.x, pos.y, pos.z);
  }
  
  _updateFly(elapsedTime) {
    const cam = this.cameras[CAMERA_TYPES.FLY];
    cam.angle = elapsedTime * 0.1;
    
    const x = Math.cos(cam.angle) * cam.radius;
    const z = Math.sin(cam.angle) * cam.radius;
    
    cam.camera.position.set(x, cam.height, z);
    cam.camera.lookAt(0, 5, 0);
  }
  
  _updateHelicam(elapsedTime) {
    const cam = this.cameras[CAMERA_TYPES.HELICAM];
    cam.orbitAngle = elapsedTime * 0.15;
    
    const x = Math.cos(cam.orbitAngle) * cam.orbitRadius;
    const z = Math.sin(cam.orbitAngle) * cam.orbitRadius;
    
    cam.camera.position.set(x, cam.orbitHeight, z);
    cam.camera.lookAt(0, 0, 0);
  }
  
  _updateFinishline() {
    const cam = this.cameras[CAMERA_TYPES.FINISHLINE];
    cam.camera.position.copy(cam.position);
    cam.camera.lookAt(cam.target);
  }
  
  _updateDrama(balls) {
    const cam = this.cameras[CAMERA_TYPES.DRAMA];
    
    // Find closest pack or leader
    let leader = balls[0];
    let maxProgress = -1;
    
    for (const ball of balls) {
      if (ball.currentSegmentT > maxProgress) {
        maxProgress = ball.currentSegmentT;
        leader = ball;
      }
    }
    
    if (leader) {
      const pos = leader.body.position;
      cam.camera.position.set(pos.x + 5, pos.y + 4, pos.z + 5);
      cam.camera.lookAt(pos);
    }
  }
  
  _autoCut(balls, elapsedTime) {
    // Pick camera based on race drama
    const cameraNames = Object.keys(this.cameras);
    
    // 40% stay on follow (primary ball)
    // 20% fly
    // 20% helicam
    // 10% drama
    // 10% finishline
    
    const roll = Math.random();
    let newCam;
    
    if (roll < 0.4) {
      newCam = CAMERA_TYPES.FOLLOW;
      // Switch follow subject to random ball
      const randomBall = balls[Math.floor(Math.random() * balls.length)];
      this.cameras[CAMERA_TYPES.FOLLOW].subject = randomBall;
    } else if (roll < 0.6) {
      newCam = CAMERA_TYPES.FLY;
    } else if (roll < 0.8) {
      newCam = CAMERA_TYPES.HELICAM;
    } else if (roll < 0.9) {
      newCam = CAMERA_TYPES.DRAMA;
    } else {
      newCam = CAMERA_TYPES.FINISHLINE;
    }
    
    this.activeCamera = this.cameras[newCam].camera;
    this.currentCameraName = newCam;
  }
  
  cutTo(cameraName) {
    if (this.cameras[cameraName]) {
      this.activeCamera = this.cameras[cameraName].camera;
      this.currentCameraName = cameraName;
    }
  }
  
  getActiveCamera() {
    return this.activeCamera;
  }
  
  getCameraNames() {
    return Object.keys(this.cameras);
  }
}
