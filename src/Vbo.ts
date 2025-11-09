export class Vbo {
  private gl: WebGL2RenderingContext;
  private vbo!: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, data: GLint, numVertices: number) {
    if (!gl) {
      throw new Error('WebGL does not work');
    }
    this.gl = gl;
    this.createVbo(data, numVertices);
  }

  public createVbo(data: GLint, numVertices: number) {
    const vbo = this.gl.createBuffer();
    if (!vbo) {
      throw new Error('Vbo does not work');
    }
    this.vbo = vbo;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, numVertices * 2 * 4, this.gl.DYNAMIC_DRAW); // x,y座標 * Float32(4バイト)

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

  public updateVbo(data: Float32Array) {
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
  }
}
