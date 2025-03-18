export class NanoKontrol2 {
  private midiAccess: MIDIAccess | null = null;
  private lastControlValues: Map<number, number> = new Map();

  constructor() {
    this.initMIDI();
  }

  private async initMIDI() {
    if (!navigator.requestMIDIAccess) {
      console.error("Web MIDI API is not supported in this browser.");
      return;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.inputs.forEach((input) => {
        console.log(`MIDI Device Found: ${input.name}`);
        input.onmidimessage = this.handleMIDIMessage.bind(this);
      });
    } catch (error) {
      console.error("Failed to access MIDI devices:", error);
    }
  }

  private handleMIDIMessage(event: MIDIMessageEvent) {
    if (!event.data || event.data.length < 3) return; // Nullチェックと長さ確認

    const data = event.data as Uint8Array;
    const [status, data1, data2] = data;
    console.log(`MIDI Message Received - Status: ${status}, Data1: ${data1}, Data2: ${data2}`);

    if (status === 176) { // 176 = Control Change (CC) message
      this.lastControlValues.set(data1, data2);
      console.log(`Control Change - Controller: ${data1}, Value: ${data2}`);
    }
  }

  public getControlValue(controller: number): number {
    return this.lastControlValues.get(controller) || 0;
  }
}
