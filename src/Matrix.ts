import { mat4 } from 'gl-matrix';

export enum ProjectionType {
  ORTHOGRAPHIC = 'orthographic',
  PERSPECTIVE = 'perspective',
}

export class Matrix {
  private gl: WebGL2RenderingContext;
  private projectionMatrix: mat4;
  private modelViewMatrix: mat4;

  constructor(gl: WebGL2RenderingContext, type: ProjectionType | null) {
    if(!gl){
      throw new Error('WebGL does not work');
    }
    this.gl = gl;
    this.projectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();

    if (type == ProjectionType.ORTHOGRAPHIC) {
      this.initProjectionMatrixOrthographic();
    } else {
      this.initProjectionMatrixPerspective();
    }
    this.initModelViewMatrix();
  }

  public getProjectionMatrix() {
    return this.projectionMatrix;
  }

  public getModelViewMatrix() {
    return this.modelViewMatrix;
  }

  // Z軸中心に回転
  public rotate(rotation: number) {
    mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      rotation,
      [0, 0, 1],
    );
  }

  // Z軸中心に拡大
  public scale(scale: number) {
    this.initModelViewMatrix();
    mat4.scale(
      this.modelViewMatrix,
      this.modelViewMatrix,
      [1.0 + scale, 1.0 + scale, 1.0],
    )
  }

  private initProjectionMatrixOrthographic() {
    mat4.ortho(this.projectionMatrix, -1.0, 1.0, -1.0, 1.0, -10.0, 10.0);
  }

  private initProjectionMatrixPerspective() {
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.gl.canvas.width / this.gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;

    mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
  }
  
  private initModelViewMatrix() {
    this.modelViewMatrix = mat4.create();
    mat4.translate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      [0.0, 0.0, -6.0],
    );
  }
}
