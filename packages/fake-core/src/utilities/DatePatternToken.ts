export interface DateObject {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
}

// フォーマットパターンの最小単位
export class DatePatternToken {
  constructor(
    public readonly type: "token" | "literal",
    public readonly value: string,
    public readonly count?: number,
  ) {}

  replace(dateObject: DateObject): string {
    if (this.type === "literal") {
      return this.value;
    }

    switch (this.value) {
      case "y":
        return this.count === 2 ? dateObject.year.slice(-2) : dateObject.year;

      case "M":
        return dateObject.month.padStart(this.count ?? 2, "0");

      case "d":
        return dateObject.day.padStart(this.count ?? 2, "0");

      case "H":
        return dateObject.hour.padStart(this.count ?? 2, "0");

      case "m":
        return dateObject.minute.padStart(this.count ?? 2, "0");

      case "s":
        return dateObject.second.padStart(this.count ?? 2, "0");

      case "S":
        return dateObject.millisecond.padStart(this.count ?? 3, "0");

      default:
        return this.value;
    }
  }

  parse(value: string, dateObject: DateObject): void {
    if (this.type === "literal") {
      return;
    }

    const length = this.count ?? 1;

    switch (this.value) {
      case "y":
        dateObject.year = value.slice(0, length);
        break;

      case "M":
        dateObject.month = value.slice(0, length);
        break;

      case "d":
        dateObject.day = value.slice(0, length);
        break;

      case "H":
        dateObject.hour = value.slice(0, length);
        break;

      case "m":
        dateObject.minute = value.slice(0, length);
        break;

      case "s":
        dateObject.second = value.slice(0, length);
        break;

      case "S":
        dateObject.millisecond = value.slice(0, length);
        break;
    }
  }
}
