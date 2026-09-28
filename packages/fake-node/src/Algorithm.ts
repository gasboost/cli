import * as crypto from "crypto";

export class Algorithm {
  public readonly name: string;
  constructor(name: string) {
    if (name === "MD2") {
      this.name = "md2";
    } else if (name === "MD5" || name === "HMAC_MD5") {
      this.name = "md5";
    } else if (
      name === "SHA_1" ||
      name === "HMAC_SHA_1" ||
      name === "RSA_SHA_1"
    ) {
      this.name = "sha1";
    } else if (
      name === "SHA_256" ||
      name === "HMAC_SHA_256" ||
      name === "RSA_SHA_256"
    ) {
      this.name = "sha256";
    } else if (name === "SHA_384" || name === "HMAC_SHA_384") {
      this.name = "sha384";
    } else if (name === "SHA_512" || name === "HMAC_SHA_512") {
      this.name = "sha512";
    } else {
      throw new Error(`Unsupported algorithm: ${name}`);
    }
  }

  isSupported(): boolean {
    return crypto.getHashes().includes(this.name);
  }
}
