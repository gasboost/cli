export class AppsScriptByte {
  constructor(public readonly bytes: Uint8Array) {}
  sign(): number[] {
    return [...this.bytes].map((byte) => (byte > 127 ? byte - 256 : byte));
  }
}
