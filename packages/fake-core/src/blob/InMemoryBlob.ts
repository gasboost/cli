import { AppsScriptByte } from "../utilities/AppsScriptByte";
import { BinaryData } from "../utilities/BinaryData";

export class InMemoryBlob implements GoogleAppsScript.Base.Blob {
  private bytes: Uint8Array;
  private contentType: string | null;
  private name: string | null;

  constructor(
    data: string | ArrayLike<number>,
    contentType: string | null = null,
    name: string | null = null,
    charset?: string,
  ) {
    const binaryData = new BinaryData(data, charset ?? "UTF_8");
    this.bytes = Uint8Array.from(binaryData.bytes);
    this.contentType = contentType;
    this.name = name;
  }

  copyBlob(): GoogleAppsScript.Base.Blob {
    return new InMemoryBlob(this.bytes, this.contentType, this.name);
  }

  getBlob(): GoogleAppsScript.Base.Blob {
    return this.copyBlob();
  }

  getAs(contentType: string): GoogleAppsScript.Base.Blob {
    return new InMemoryBlob(this.bytes, contentType, this.name);
  }

  getBytes(): number[] {
    const appsScriptByte = new AppsScriptByte(this.bytes);
    return appsScriptByte.sign();
  }

  getContentType(): string | null {
    return this.contentType;
  }

  getDataAsString(charset?: string): string {
    return new BinaryData(this.bytes, charset ?? "UTF_8").decode();
  }

  getName(): string | null {
    return this.name;
  }

  isGoogleType(): boolean {
    return false;
  }

  setBytes(data: number[]): GoogleAppsScript.Base.Blob {
    this.bytes = Uint8Array.from(data);
    return this;
  }

  setContentType(contentType: string | null): GoogleAppsScript.Base.Blob {
    this.contentType = contentType;
    return this;
  }

  setContentTypeFromExtension(): GoogleAppsScript.Base.Blob {
    return this;
  }

  setDataFromString(
    value: string,
    charset?: string,
  ): GoogleAppsScript.Base.Blob {
    this.bytes = new BinaryData(value, charset ?? "UTF_8").bytes;
    return this;
  }

  setName(name: string): GoogleAppsScript.Base.Blob {
    this.name = name;
    return this;
  }

  /** @deprecated DO NOT USE */
  getAllBlobs(): GoogleAppsScript.Base.Blob[] {
    return [this.copyBlob()];
  }
}
