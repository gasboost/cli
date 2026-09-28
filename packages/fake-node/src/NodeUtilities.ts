import {
  AppsScriptByte,
  BinaryData,
  DateFormatPattern,
  InMemoryBlob,
  Md2,
  PartedDate,
} from "@gasboost/fake-core";
import { fromZonedTime } from "date-fns-tz";
import { unzipSync, zipSync } from "fflate";
import * as crypto from "node:crypto";
import * as util from "node:util";
import * as zlib from "node:zlib";
import { Algorithm } from "./Algorithm";

export const Charset = {
  US_ASCII: "US_ASCII",
  UTF_8: "UTF_8",
} as const;

export const DigestAlgorithms = {
  MD2: "MD2",
  MD5: "MD5",
  SHA_1: "SHA_1",
  SHA_256: "SHA_256",
  SHA_384: "SHA_384",
  SHA_512: "SHA_512",
} as const;

export const MacAlgorithms = {
  HMAC_MD5: "HMAC_MD5",
  HMAC_SHA_1: "HMAC_SHA_1",
  HMAC_SHA_256: "HMAC_SHA_256",
  HMAC_SHA_384: "HMAC_SHA_384",
  HMAC_SHA_512: "HMAC_SHA_512",
} as const;

export const RsaAlgorithm = {
  RSA_SHA_1: "RSA_SHA_1",
  RSA_SHA_256: "RSA_SHA_256",
} as const;

export class NodeUtilities implements GoogleAppsScript.Utilities.Utilities {
  getUuid(): string {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return template.replace(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      const value = character === "x" ? random : (random % 4) + 8;
      return value.toString(16);
    });
  }

  base64Encode(
    data: string | ArrayLike<number>,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): string {
    const binaryData = new BinaryData(data, charset?.toString());
    return this.encodeBase64(binaryData.bytes);
  }

  base64EncodeWebSafe(
    data: string | ArrayLike<number>,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): string {
    const binaryData = new BinaryData(data, charset?.toString());

    return this.encodeBase64(binaryData.bytes)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  base64Decode(
    encoded: string,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    void charset;

    return new AppsScriptByte(this.decodeBase64(encoded)).sign();
  }

  base64DecodeWebSafe(
    encoded: string,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    void charset;

    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");

    return new AppsScriptByte(this.decodeBase64(normalized)).sign();
  }

  formatDate(date: Date, timeZone: string, format: string): string {
    const partedDate = new PartedDate(date, timeZone);
    const formatPattern = new DateFormatPattern(format);

    return formatPattern.tokens
      .map((token) => token.replace(partedDate))
      .join("");
  }

  formatString(template: string, ...args: unknown[]): string {
    if (!/%[sdifjoOc%]/.test(template)) {
      return template;
    }

    return util.format(template, ...args);
  }

  computeDigest(
    algorithm: GoogleAppsScript.Utilities.DigestAlgorithm,
    value: string | ArrayLike<number>,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    const digestAlgorithm = new Algorithm(algorithm.toString());
    const binaryData = new BinaryData(value, charset?.toString());

    if (digestAlgorithm.name === "md2") {
      const md2 = new Md2(binaryData.bytes);
      return new AppsScriptByte(Uint8Array.from(md2.digest)).sign();
    }

    if (!digestAlgorithm.isSupported()) {
      throw new Error(
        "The specified digest algorithm is not supported in this environment: " +
          digestAlgorithm.name,
      );
    }

    const hash = crypto.createHash(digestAlgorithm.name);
    hash.update(binaryData.bytes);

    return new AppsScriptByte(Uint8Array.from(hash.digest())).sign();
  }

  computeHmacSignature(
    algorithm: GoogleAppsScript.Utilities.MacAlgorithm,
    value: string | ArrayLike<number>,
    key: string | ArrayLike<number>,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    const macAlgorithm = new Algorithm(algorithm.toString());
    const binaryData = new BinaryData(value, charset?.toString());
    const keyData = new BinaryData(key, charset?.toString());

    const hmac = crypto.createHmac(macAlgorithm.name, keyData.bytes);
    hmac.update(binaryData.bytes);

    return new AppsScriptByte(Uint8Array.from(hmac.digest())).sign();
  }

  computeHmacSha256Signature(
    value: string | ArrayLike<number>,
    key: string | ArrayLike<number>,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    return this.computeHmacSignature(
      this.MacAlgorithm.HMAC_SHA_256,
      value,
      key,
      charset,
    );
  }

  computeRsaSignature(
    algorithm: GoogleAppsScript.Utilities.RsaAlgorithm,
    value: string,
    key: string,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    const rsaAlgorithm = new Algorithm(algorithm.toString());
    const binaryData = new BinaryData(value, charset?.toString());

    const signer = crypto.createSign(rsaAlgorithm.name);
    signer.update(binaryData.bytes);

    return new AppsScriptByte(Uint8Array.from(signer.sign(key))).sign();
  }

  computeRsaSha1Signature(
    value: string,
    key: string,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    return this.computeRsaSignature(
      this.RsaAlgorithm.RSA_SHA_1,
      value,
      key,
      charset,
    );
  }

  computeRsaSha256Signature(
    value: string,
    key: string,
    charset?: GoogleAppsScript.Utilities.Charset,
  ): number[] {
    return this.computeRsaSignature(
      this.RsaAlgorithm.RSA_SHA_256,
      value,
      key,
      charset,
    );
  }

  newBlob(
    data: string | ArrayLike<number>,
    contentType?: string,
    name?: string,
  ): GoogleAppsScript.Base.Blob {
    return new InMemoryBlob(data, contentType ?? null, name ?? null);
  }

  gzip(
    blob: GoogleAppsScript.Base.BlobSource,
    name?: string,
  ): GoogleAppsScript.Base.Blob {
    const sourceBlob = blob.getBlob();
    const bytes = new AppsScriptByte(Uint8Array.from(sourceBlob.getBytes()))
      .bytes;

    const gzipped = Uint8Array.from(zlib.gzipSync(bytes));
    gzipped[9] = 0xff;

    return new InMemoryBlob(
      gzipped,
      sourceBlob.getContentType(),
      name ?? sourceBlob.getName(),
    );
  }

  ungzip(blob: GoogleAppsScript.Base.BlobSource): GoogleAppsScript.Base.Blob {
    const sourceBlob = blob.getBlob();
    const bytes = new AppsScriptByte(Uint8Array.from(sourceBlob.getBytes()))
      .bytes;

    const ungzipped = Uint8Array.from(zlib.gunzipSync(bytes));

    return new InMemoryBlob(
      ungzipped,
      sourceBlob.getContentType(),
      sourceBlob.getName(),
    );
  }

  zip(
    blobs: GoogleAppsScript.Base.BlobSource[],
    name?: string,
  ): GoogleAppsScript.Base.Blob {
    const files: Record<string, Uint8Array> = {};

    for (const sourceBlob of blobs) {
      const blob = sourceBlob.getBlob();

      files[blob.getName() ?? "Untitled.txt"] = Uint8Array.from(
        blob.getBytes(),
        (byte) => byte & 0xff,
      );
    }

    const zipped = zipSync(files);

    return new InMemoryBlob(zipped, "application/zip", name ?? null);
  }

  unzip(blob: GoogleAppsScript.Base.BlobSource): GoogleAppsScript.Base.Blob[] {
    const sourceBlob = blob.getBlob();

    const bytes = Uint8Array.from(sourceBlob.getBytes(), (byte) => byte & 0xff);

    const unzipped = unzipSync(bytes);

    return Object.entries(unzipped).map(([name, data]) => {
      return new InMemoryBlob(data, null, name);
    });
  }

  parseDate(date: string, timeZone: string, format: string): Date {
    const pattern = new DateFormatPattern(format);
    const partedDate = new PartedDate(new Date(0), "UTC");
    const parsedDate = pattern.parse(date, partedDate);

    return fromZonedTime(parsedDate, timeZone);
  }

  parseCsv(csv: string, delimiter?: string): string[][] {
    const separator = delimiter ?? ",";
    const normalized = csv.replace(/\r\n?/g, "\n");

    const rows: string[][] = [];

    let row: string[] = [];
    let field = "";
    let index = 0;
    let inQuotes = false;

    while (index < normalized.length) {
      const character = normalized[index];

      if (inQuotes) {
        if (character === '"' && normalized[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }

        if (character === '"') {
          inQuotes = false;
          index += 1;
          continue;
        }

        field += character;
        index += 1;
        continue;
      }

      if (character === '"') {
        inQuotes = true;
        index += 1;
        continue;
      }

      if (character === separator) {
        row.push(field);
        field = "";
        index += 1;
        continue;
      }

      if (character === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        index += 1;
        continue;
      }

      field += character;
      index += 1;
    }

    row.push(field);
    rows.push(row);

    return rows;
  }

  sleep(milliseconds: number): void {
    const end = Date.now() + milliseconds;
    while (Date.now() < end) {
      // Intentionally wait to emulate Utilities.sleep().
    }
  }

  public readonly Charset =
    Charset as unknown as typeof GoogleAppsScript.Utilities.Charset;

  public readonly DigestAlgorithm =
    DigestAlgorithms as unknown as typeof GoogleAppsScript.Utilities.DigestAlgorithm;

  public readonly MacAlgorithm =
    MacAlgorithms as unknown as typeof GoogleAppsScript.Utilities.MacAlgorithm;

  public readonly RsaAlgorithm =
    RsaAlgorithm as unknown as typeof GoogleAppsScript.Utilities.RsaAlgorithm;

  jsonParse(jsonString: string): unknown {
    return JSON.parse(jsonString);
  }

  jsonStringify(value: unknown): string {
    return JSON.stringify(value);
  }

  private encodeBase64(bytes: Uint8Array): string {
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let result = "";

    for (let index = 0; index < bytes.length; index += 3) {
      const first = bytes[index];
      const second = bytes[index + 1];
      const third = bytes[index + 2];

      const value = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

      result += alphabet[(value >> 18) & 63];
      result += alphabet[(value >> 12) & 63];
      result += second === undefined ? "=" : alphabet[(value >> 6) & 63];
      result += third === undefined ? "=" : alphabet[value & 63];
    }

    return result;
  }

  private decodeBase64(encoded: string): Uint8Array {
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    const normalized =
      encoded.replace(/\s/g, "") + "=".repeat((4 - (encoded.length % 4)) % 4);

    const bytes: number[] = [];

    for (let index = 0; index < normalized.length; index += 4) {
      const first = alphabet.indexOf(normalized[index]);
      const second = alphabet.indexOf(normalized[index + 1]);
      const third =
        normalized[index + 2] === "="
          ? 0
          : alphabet.indexOf(normalized[index + 2]);
      const fourth =
        normalized[index + 3] === "="
          ? 0
          : alphabet.indexOf(normalized[index + 3]);

      const value = (first << 18) | (second << 12) | (third << 6) | fourth;

      bytes.push((value >> 16) & 0xff);

      if (normalized[index + 2] !== "=") {
        bytes.push((value >> 8) & 0xff);
      }

      if (normalized[index + 3] !== "=") {
        bytes.push(value & 0xff);
      }
    }

    return Uint8Array.from(bytes);
  }
}
