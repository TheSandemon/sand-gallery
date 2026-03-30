export class Recorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.fps = options.fps || 30;
    this.mediaRecorder = null;
    this.chunks = [];
    this.recording = false;
    this.startTime = null;
  }
  
  async start() {
    if (!this.canvas) {
      throw new Error('No canvas provided to Recorder');
    }
    
    const stream = this.canvas.captureStream(this.fps);
    
    // Try different codecs for browser compatibility
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    
    let mimeType = null;
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    
    if (!mimeType) {
      mimeType = ''; // Let browser pick
    }
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5000000 // 5 Mbps
    });
    
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    
    this.mediaRecorder.start(100); // Collect data every 100ms
    this.recording = true;
    this.startTime = Date.now();
    
    return this;
  }
  
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.recording) {
        reject(new Error('Not recording'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mediaRecorder.mimeType || 'video/webm'
        });
        this.recording = false;
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  async save(filePath) {
    const blob = await this.stop();
    const buffer = await blob.arrayBuffer();
    const { writeFile } = await import('fs/promises');
    await writeFile(filePath, Buffer.from(buffer));
    return filePath;
  }
  
  getRecordingDuration() {
    if (this.startTime) {
      return (Date.now() - this.startTime) / 1000;
    }
    return 0;
  }
  
  isRecording() {
    return this.recording;
  }
}
