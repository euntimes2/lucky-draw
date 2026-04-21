export class VideoRecorder {
  private mediaRecorder?: MediaRecorder;
  private chunks: Blob[] = [];

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas.captureStream || typeof MediaRecorder === 'undefined') {
      return;
    }

    try {
      this.mediaRecorder = new MediaRecorder(canvas.captureStream(), {
        videoBitsPerSecond: 6000000,
      });
    } catch {
      this.mediaRecorder = undefined;
    }
  }

  public async start() {
    if (!this.mediaRecorder) return;

    return new Promise<void>((rs) => {
      this.chunks = [];
      this.mediaRecorder!.ondataavailable = (e: BlobEvent) => {
        this.chunks.push(e.data);
      };
      this.mediaRecorder!.onstop = () => {
        this.chunks = [];
      };
      this.mediaRecorder!.onstart = () => {
        rs();
      };
      this.mediaRecorder!.start();
    });
  }

  public stop() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }
}
