import { InMemoryBlob } from "../blob/InMemoryBlob";
import { BinaryData } from "../utilities/BinaryData";

export type HttpResponseHeaders = Record<string, string | string[]>;

export class InMemoryHttpResponse
  implements GoogleAppsScript.URL_Fetch.HTTPResponse
{
  private content: Uint8Array;
  private responseCode: number;
  private headers: HttpResponseHeaders;

  constructor(
    data: string | ArrayLike<number>,
    responseCode = 200,
    headers: HttpResponseHeaders = {},
    charset?: string,
  ) {
    this.content = new BinaryData(data, charset ?? "UTF_8").bytes;
    this.responseCode = responseCode;
    this.headers = {};

    for (const [name, value] of Object.entries(headers)) {
      this.headers[name] = Array.isArray(value) ? [...value] : value;
    }
  }

  getAllHeaders(): object {
    const headers: HttpResponseHeaders = {};

    for (const [name, value] of Object.entries(this.headers)) {
      headers[name] = Array.isArray(value) ? [...value] : value;
    }

    return headers;
  }

  getAs(contentType: string): GoogleAppsScript.Base.Blob {
    return this.getBlob().getAs(contentType);
  }

  getBlob(): GoogleAppsScript.Base.Blob {
    let contentType: string | null = null;

    for (const [name, value] of Object.entries(this.headers)) {
      if (name.toLowerCase() === "content-type") {
        contentType = Array.isArray(value) ? (value[0] ?? null) : value;
        break;
      }
    }

    return new InMemoryBlob(this.content, contentType);
  }

  getContent(): number[] {
    return new BinaryData(this.content).signedBytes();
  }

  getContentText(charset?: string): string {
    return new BinaryData(this.content, charset ?? "UTF_8").decode();
  }

  getHeaders(): object {
    const headers: Record<string, string> = {};

    for (const [name, value] of Object.entries(this.headers)) {
      headers[name] = Array.isArray(value) ? (value[0] ?? "") : value;
    }

    return headers;
  }

  getResponseCode(): number {
    return this.responseCode;
  }
}
