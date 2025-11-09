import React, { useRef, useEffect } from 'react';
import { Matrix, ProjectionType } from './Matrix';
import { Shader } from './Shader';
import { Vbo } from './Vbo';
import { Animation } from './Animation'
import { MidiController } from './MidiController';
import { VFX } from '@vfx-js/core';
import * as Tone from 'tone';

const GlCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const stopButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: true }) as WebGL2RenderingContext;
    if (!gl) {
      console.error('WebGL is not supported');
      return;
    }
    const ctx = canvas.getContext('2d');

    playButtonRef.current?.addEventListener('click', async () => {
      await Tone.start();
      pattern.start(0);
      Tone.getTransport().start();
    });

    stopButtonRef.current?.addEventListener('click', async () => {
      Tone.getTransport().stop();
    });

    const matrix = new Matrix(gl, ProjectionType.ORTHOGRAPHIC);
    //const matrix = new Matrix(gl, ProjectionType.PERSPECTIVE);
    const shader = new Shader(gl);

    const numVertices = Animation.getNumVertices();
    const vbo = new Vbo(gl, shader.getVertexAttribLocation(), numVertices);

    const animation = new Animation(vbo, gl);
    animation.setStartPosition();;
    const vfx = new VFX();

    const kick = new Tone.MembraneSynth().toDestination();
    const pattern = new Tone.Loop((time) => {
      kick.triggerAttackRelease('C1', '8n', time); // C1は低音のキックサウンド
    }, '4n'); // 4分音符

    const analyser = new Tone.Analyser('waveform', 256);
    kick.connect(analyser);

    let slider0Value: number = 0;
    let midiController: MidiController | null = null;

    const createMidiController = async() => {
      try {
        midiController = await MidiController.create();
        midiController.onSlider0((value: number) => {
          slider0Value = value;
        });
      } catch (error: unknown) {
        console.log(error);
      }
    }

    const scene = (rotation: number, deltaTime: number) => {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const waveform: Float32Array = analyser.getValue() as Float32Array;
      const volume = Math.sqrt(
        waveform.reduce((sum: number, value: number): number => sum + value ** 2, 0) / waveform.length
      );
      
      const projectionMatrix = matrix.getProjectionMatrix();
      matrix.scale(volume);
      matrix.rotate(rotation);
      const modelViewMatrix = matrix.getModelViewMatrix();

      shader.useShader();
      shader.setProjectMatrixUniform(projectionMatrix);
      shader.setModelViewMatrixUniform(modelViewMatrix);
      shader.setTimeUniform(deltaTime);
      shader.setVolumeUniform(volume);
      shader.setSliderValueUniform(slider0Value);
      gl.drawArrays(gl.LINE_LOOP, 0, numVertices);
      //gl.flush();
      vfx.update(canvas);
    };

    let then = 0;
    let rotation = 0.0;
    let deltaTime = 0;

    const render = (now: number) => {
      now *= 0.0001;
      deltaTime = now - then;
      then = now;
      scene(rotation, now);

      rotation += deltaTime;
      requestAnimationFrame(render);
    }

    // MIDIコントローラーを初期化（1回だけ実行）
    createMidiController();

    //vfx.add(canvas, {shader: 'rgbShift'});
    vfx.add(canvas, {shader: 'halftone'});
    requestAnimationFrame(render);
  }, []);


  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} />
      <div>
        <button ref={playButtonRef}>Play</button>
        <button ref={stopButtonRef}>Stop</button>
      </div>
    </div>
  );
};

export default GlCanvas;
