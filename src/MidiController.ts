import { korgNanoKontrol2 } from 'korg-nano-kontrol2';
import type { KorgDevice } from 'korg-nano-kontrol2';

export class MidiController {

  private device: KorgDevice;

  private constructor(device: KorgDevice) {
    this.device = device;
  }

  static async create(): Promise<MidiController> {
    try {
      const device = await korgNanoKontrol2.connect(); // 非同期でデバイス取得
      return new MidiController(device);
    } catch (error) {
      throw new Error('midi device not found');
    }
  }

  onSlider0(callback: (value: number) => void) {
    this.device.on('slider:0', (value: number) => {
      callback(value);
    });
  }
}
