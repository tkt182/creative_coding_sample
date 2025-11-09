import { mat4 } from 'gl-matrix';

export class Shader {
  private gl: WebGL2RenderingContext;
  private vertexShaderSource: string;
  private fragmentShaderSource: string;
  private vertexShader: WebGLShader;
  private fragmentShader: WebGLShader;
  private shaderProgram: WebGLProgram;

  constructor(gl: WebGL2RenderingContext) {
    if(!gl){
      throw new Error('WebGL does not work');
    }
    this.gl = gl;

    this.vertexShaderSource = `#version 300 es
      in vec4 aVertexPosition;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform float uTime;
      uniform float uVolume;

      // 格子点の勾配ベクトルをランダムに決定
      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float perlin2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        
        // 4つの角の勾配ベクトル
        vec2 g00 = hash(i + vec2(0.0, 0.0));
        vec2 g10 = hash(i + vec2(1.0, 0.0));
        vec2 g01 = hash(i + vec2(0.0, 1.0));
        vec2 g11 = hash(i + vec2(1.0, 1.0));
        
        // 各角からの距離ベクトル
        vec2 d00 = f - vec2(0.0, 0.0);
        vec2 d10 = f - vec2(1.0, 0.0);
        vec2 d01 = f - vec2(0.0, 1.0);
        vec2 d11 = f - vec2(1.0, 1.0);
        
        // ドット積による勾配計算
        float n00 = dot(g00, d00);
        float n10 = dot(g10, d10);
        float n01 = dot(g01, d01);
        float n11 = dot(g11, d11);
        
        // フェード関数を適用し、距離ベクトルを滑らかにする
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        
        // バイリニア補間
        return mix(mix(n00, n10, u.x),
                   mix(n01, n11, u.x), u.y);
      }

      void main() {
        float x = aVertexPosition.x;
        float y = aVertexPosition.y;

        // Perlinノイズによる位置変更
        float xNoise = perlin2(vec2(uTime + y + uVolume, uTime * y * uVolume));
        float yNoise = perlin2(vec2(uTime * x * uVolume, uTime + x + uVolume));
        
        vec2 noisedPosition = vec2(x + xNoise, y + yNoise);
        vec4 finalPosition = vec4(noisedPosition, aVertexPosition.z, aVertexPosition.w);
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * finalPosition;
      }
    `;

    this.fragmentShaderSource = `#version 300 es
      precision mediump float;
      out vec4 fragColor;
      void main() {
        float dist = abs(gl_FragCoord.z);
        float alpha = smoothstep(1.0, 1.5, dist);
        vec4 color = vec4(1.0, 1.0, 1.0, 1.0 * (1.0 - alpha));
        fragColor = color;
      }
    `;

    this.vertexShader = this.loadShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
    this.fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);

    const shaderProgram = this.gl.createProgram();
    if (!shaderProgram) {
      throw new Error('Shader program creation failed.');
    }
    this.shaderProgram = shaderProgram;

    this.gl.attachShader(shaderProgram, this.vertexShader);
    this.gl.attachShader(shaderProgram, this.fragmentShader);
    this.gl.linkProgram(shaderProgram);
  }

  public useShader() {
    this.gl.useProgram(this.shaderProgram);
  }

  public setProjectMatrixUniform(matrix: mat4) {
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
      false,
      matrix
    );
  }

  public setModelViewMatrixUniform(matrix: mat4) {
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
      false,
      matrix
    );
  }

  public setUniform4fv(name: string, matrix: mat4) {
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, name),
      false,
      matrix
    );
  }

  public setTimeUniform(time: number) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, 'uTime'), time);
  }

  public setVolumeUniform(volume: number) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, 'uVolume'), volume);
  }

  public setSliderValueUniform(sliderValue: number) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, 'uSliderValue'), sliderValue);
  }

  public getVertexAttribLocation() {
    return this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
  }

  private loadShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('shader does not work');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
    }
    return shader;
  }
}
