import { DateObject, DatePatternToken } from "./DatePatternToken";

// フォーマットパターン
export class DateFormatPattern {
  readonly source: string;
  readonly tokens: DatePatternToken[];

  constructor(source: string, treatAnyLetterAsToken = false) {
    this.source = source;
    const tokens: DatePatternToken[] = [];
    let index = 0;

    while (index < source.length) {
      const character = source[index];

      // クォート文字列
      if (character === "'") {
        let literal = "";
        index += 1;

        while (index < source.length) {
          if (source[index] === "'") {
            if (source[index + 1] === "'") {
              literal += "'";
              index += 2;
              continue;
            }

            index += 1;
            break;
          }

          literal += source[index];
          index += 1;
        }

        tokens.push(new DatePatternToken("literal", literal));

        continue;
      }

      // トークン
      const isToken = treatAnyLetterAsToken
        ? /[A-Za-z]/.test(character)
        : /[yMdHmsS]/.test(character);

      if (isToken) {
        let count = 1;

        while (
          index + count < source.length &&
          source[index + count] === character
        ) {
          count += 1;
        }

        tokens.push(new DatePatternToken("token", character, count));

        index += count;
        continue;
      }

      // 通常文字
      tokens.push(new DatePatternToken("literal", character));

      index += 1;
    }

    this.tokens = tokens;
  }

  parse(value: string, dateObject: DateObject): Date {
    let cursor = 0;

    for (let index = 0; index < this.tokens.length; index += 1) {
      const token = this.tokens[index];

      if (token.type === "literal") {
        cursor += token.value.length;
        continue;
      }

      const nextLiteral = this.tokens
        .slice(index + 1)
        .find((token) => token.type === "literal");

      let raw: string;

      if (nextLiteral) {
        const nextIndex = value.indexOf(nextLiteral.value, cursor);

        raw = value.slice(cursor, nextIndex);

        cursor = nextIndex;
      } else {
        raw = value.slice(cursor);

        cursor = value.length;
      }

      token.parse(raw, dateObject);
    }

    return new Date(
      Number(dateObject.year),
      Number(dateObject.month) - 1,
      Number(dateObject.day),
      Number(dateObject.hour),
      Number(dateObject.minute),
      Number(dateObject.second),
      Number(dateObject.millisecond),
    );
  }
}
