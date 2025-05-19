
export class Sender {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pc: RTCPeerConnection;
  private ws: WebSocket;

  constructor() {
    this.canvas = document.getElementById('vjCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ws = new WebSocket('ws://localhost:8080');
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    this.setup();
    this.drawLoop(0);
  }

  private drawLoop(t: number): void {
    this.ctx.fillStyle = `hsl(${t / 50 % 360}, 100%, 50%)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    requestAnimationFrame(this.drawLoop.bind(this));
  }

  private setup(): void {
    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) this.ws.send(JSON.stringify({ candidate }));
    };

    this.ws.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.answer) {
        await this.pc.setRemoteDescription(msg.answer);
      }
      if (msg.candidate) {
        await this.pc.addIceCandidate(msg.candidate);
      }
    };

    const stream = this.canvas.captureStream(30);
    stream.getTracks().forEach(track => this.pc.addTrack(track, stream));

    this.pc.createOffer().then(offer => {
      this.pc.setLocalDescription(offer);
      this.ws.send(JSON.stringify({ offer }));
    });
  }
}