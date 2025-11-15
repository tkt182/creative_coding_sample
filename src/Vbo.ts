export class Vbo {
  private gl: WebGL2RenderingContext;
  private vbo!: WebGLBuffer;
  private prevNumVertices: number = 0;
  private numVertices: number = 0;

  constructor(gl: WebGL2RenderingContext, data: GLint) {
    if (!gl) {
      throw new Error('WebGL does not work');
    }
    this.gl = gl;
    this.createVbo(data);
  }

  public createVbo(data: GLint) {
    const vbo = this.gl.createBuffer();
    if (!vbo) {
      throw new Error('Vbo does not work');
    }
    this.vbo = vbo;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

    const numComponents = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    this.gl.vertexAttribPointer(
      data,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );

    this.gl.enableVertexAttribArray(data);
  }

  public updateVbo(data: Float32Array, numVertices: number) {
    this.numVertices = numVertices;
    if (this.numVertices !== this.prevNumVertices) {
      this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
    }
    else {
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
    }
    this.prevNumVertices = this.numVertices;
  }
}
