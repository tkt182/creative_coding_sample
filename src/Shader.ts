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
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
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
