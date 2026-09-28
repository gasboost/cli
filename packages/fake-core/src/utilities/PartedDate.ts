import { DateObject } from "./DatePatternToken";

// 分解された日付
export class PartedDate implements DateObject {
  public readonly year: string;
  public readonly month: string;
  public readonly day: string;
  public readonly hour: string;
  public readonly minute: string;
  public readonly second: string;
  public readonly millisecond: string;

  constructor(date: Date, timeZone: string) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts: Record<string, string> = {};
    for (const part of formatter.formatToParts(date)) {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }
    }

    this.year = parts.year;
    this.month = parts.month;
    this.day = parts.day;
    this.hour = parts.hour;
    this.minute = parts.minute;
    this.second = parts.second;
    this.millisecond =
      parts.millisecond || String(date.getMilliseconds()).padStart(3, "0");
  }
}
