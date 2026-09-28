import { AppsScriptByte } from "./AppsScriptByte";
import { StringCode } from "./StringCode";

export class BinaryData {
  public readonly bytes: Uint8Array;
  constructor(value: string | ArrayLike<number>, charset?: string) {
    if (typeof value === "string") {
      const stringCode = new StringCode(charset?.toString());
      const normalized = stringCode.normalized(value);
      this.bytes = new TextEncoder().encode(normalized);
      return;
    }
    this.bytes = Uint8Array.from(value);
  }
  signedBytes(): number[] {
    return new AppsScriptByte(this.bytes).sign();
  }
  decode(): string {
    return new TextDecoder().decode(this.bytes);
  }
}
