import { Vbo } from './Vbo';
import { MidiController } from 'MidiController';
//@ts-ignore
import { Noise } from 'noisejs';

export class Animation {
  private vbo: Vbo;
  private gl: WebGL2RenderingContext;
  private noise;

  constructor(vbo: Vbo, gl: WebGL2RenderingContext) {
    this.vbo = vbo;
    this.gl = gl;
    this.noise = new Noise(Math.random());
  }

  public animate(time: number, volume: number, silderValue: number) {
    const numVertices = silderValue * 100 || 2500;
    const tau = 2.0 * Math.PI;
    const vertices = [];
    const a = 1.0;
    const n = 1020.0;
    const d = 1021.0;
    const maxTheta = tau * (d / this.gcd(n, d)); 
    const stepSize = maxTheta / numVertices;

    for(let theta = 0.0; theta < maxTheta; theta += stepSize) {
      const r = a * Math.sin(n / d * theta);
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const xnoize = this.noise.perlin2(time + y + volume, 0);
      const ynoize = this.noise.perlin2(0, time + x + volume);
      vertices.push(x + xnoize, y + ynoize);
    }

    this.vbo.updateVbo(new Float32Array(vertices), numVertices);
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, numVertices);
  }

  private gcd(x: number, y: number): number {
    return y === 0 ? x : this.gcd(y, x % y);
  }

  private mapRange(value: number, outMin: number, outMax: number) {
    return outMin + (outMax - outMin) * value;
  }
}
