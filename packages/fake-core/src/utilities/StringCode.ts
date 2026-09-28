export class StringCode {
  public readonly name: "ascii" | "utf8";
  constructor(charset?: string) {
    switch (charset) {
      case "UTF_8":
        this.name = "utf8";
        break;
      case "US_ASCII":
      case undefined:
        this.name = "ascii";
        break;
      default:
        throw new Error(`Unsupported charset: ${charset}`);
    }
  }
  normalized(data: string): string {
    if (this.name !== "ascii") {
      return data;
    }
    return [...data]
      .map((char) => (char.charCodeAt(0) <= 0x7f ? char : "?"))
      .join("");
  }
}
