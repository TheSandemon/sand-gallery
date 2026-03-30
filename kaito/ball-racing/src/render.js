import * as THREE from 'three';

export class Renderer {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.size = { width: 1920, height: 1080 };
    this._initialized = false;
  }
  
  init(domElement, options = {}) {
    const { width = 1920, height = 1080, antialias = true, alpha = false } = options;
    
    this.size = { width, height };
    
    this.renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
      preserveDrawingBuffer: true // Needed for canvas capture
    });
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(1); // Keep at 1 for consistent capture
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (domElement) {
      domElement.appendChild(this.renderer.domElement);
    }
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a15);
    this.scene.fog = new THREE.Fog(0x0a0a15, 50, 200);
    
    this._initialized = true;
    this._setupLights();
    
    return this;
  }
  
  _setupLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);
    
    // Main directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    this.scene.add(sun);
    
    // Fill light
    const fill = new THREE.DirectionalLight(0x8080ff, 0.3);
    fill.position.set(-30, 50, -30);
    this.scene.add(fill);
    
    // Rim light
    const rim = new THREE.DirectionalLight(0xff8080, 0.2);
    rim.position.set(0, 20, -50);
    this.scene.add(rim);
  }
  
  addMesh(mesh) {
    if (this.scene) {
      this.scene.add(mesh);
    }
  }
  
  addToScene(objects) {
    for (const obj of objects) {
      this.scene.add(obj);
    }
  }
  
  render(camera) {
    if (this.renderer && this.scene && camera) {
      this.renderer.render(this.scene, camera);
    }
  }
  
  captureFrame() {
    if (this.renderer) {
      return this.renderer.domElement.toDataURL('image/png');
    }
    return null;
  }
  
  getCanvas() {
    return this.renderer ? this.renderer.domElement : null;
  }
  
  setSize(width, height) {
    this.size = { width, height };
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
  
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
