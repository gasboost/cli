import { InMemoryBlob } from "@gasboost/fake-core";
import fs from "fs";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Algorithm } from "./Algorithm";
import { NodeUtilities } from "./NodeUtilities";

describe("UUIDの生成", () => {
  it("UUID v4形式で生成される", () => {
    const utilities = new NodeUtilities();
    const uuid = utilities.getUuid();

    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe("Base64エンコード", () => {
  it("バイナリを直接エンコードする", () => {
    const utilities = new NodeUtilities();

    expect(
      utilities.base64Encode(Uint8Array.from([71, 79, 79, 71, 76, 69])),
    ).toBe("R09PR0xF");
  });

  it("'テストデータ'をUTF-8でエンコードすると、'44OG44K544OI44OH44O844K/'になる", () => {
    const utilities = new NodeUtilities();

    expect(
      utilities.base64Encode("テストデータ", utilities.Charset.UTF_8),
    ).toBe("44OG44K544OI44OH44O844K/");
  });

  it("'テストデータ'を文字コード未指定でエンコードすると、'Pz8/Pz8/'になる", () => {
    const utilities = new NodeUtilities();
    const encoded = utilities.base64Encode("テストデータ");
    expect(encoded).toBe("Pz8/Pz8/"); // 日本語がASCIIにないため、？に置換されるから
  });

  it("'テストデータ'をWEBセーフでUTF-8でエンコードすると'44OG44K544OI44OH44O844K_'になる", () => {
    const utilities = new NodeUtilities();

    const input = "テストデータ";
    expect(utilities.base64EncodeWebSafe(input, utilities.Charset.UTF_8)).toBe(
      "44OG44K544OI44OH44O844K_",
    );
  });
});

describe("Base64デコード", () => {
  it("'R09PR0xF'をデコードすると、Uint8Array.from([71, 79, 79, 71, 76, 69])になる", () => {
    const utilities = new NodeUtilities();
    expect(utilities.base64Decode("R09PR0xF")).toEqual([
      71, 79, 79, 71, 76, 69,
    ]);
  });

  it("'44OG44K544OI44OH44O844K/'をUTF-8でデコードすると、'[-29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121,-29, -125, -68, -29, -126, -65,]'になる", () => {
    const utilities = new NodeUtilities();
    const decodedBytes = utilities.base64Decode(
      "44OG44K544OI44OH44O844K/",
      utilities.Charset.UTF_8,
    );
    expect(decodedBytes).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });

  it("'44OG44K544OI44OH44O844K/'を文字コード未指定でデコードすると、'[-29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121,-29, -125, -68, -29, -126, -65,]'になる", () => {
    const utilities = new NodeUtilities();
    const decodedBytes = utilities.base64Decode("44OG44K544OI44OH44O844K/");
    expect(decodedBytes).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });

  it("'44OG44K544OI44OH44O844K_'をWEBセーフでデコードすると、'[-29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121,-29, -125, -68, -29, -126, -65,]'になる", () => {
    const utilities = new NodeUtilities();
    const decodedBytes = utilities.base64DecodeWebSafe(
      "44OG44K544OI44OH44O844K_",
    );
    expect(decodedBytes).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });
});

describe("日付のフォーマット", () => {
  it("'2024-01-01T00:00:00Z'をUTCで'yyyy/MM/dd HH:mm:ss'フォーマットすると、'2024/01/01 00:00:00'になる", () => {
    const utilities = new NodeUtilities();
    const date = new Date("2024-01-01T00:00:00Z");
    const formattedDate = utilities.formatDate(
      date,
      "UTC",
      "yyyy/MM/dd HH:mm:ss",
    );
    expect(formattedDate).toBe("2024/01/01 00:00:00");
  });

  it("'2024-01-01T00:00:00Z'をUTCで'yyyy年MM月dd日 HH時mm分ss秒'フォーマットすると、'2024年01月01日 00時00分00秒'になる", () => {
    const utilities = new NodeUtilities();
    const date = new Date("2024-01-01T00:00:00Z");
    const formattedDate = utilities.formatDate(
      date,
      "UTC",
      "yyyy年MM月dd日 HH時mm分ss秒",
    );
    expect(formattedDate).toBe("2024年01月01日 00時00分00秒");
  });

  it("'2024-01-01T00:00:00Z'をAsia/Tokyoで'yyyy/MM/dd HH:mm:ss'フォーマットすると、'2024/01/01 09:00:00'になる", () => {
    const utilities = new NodeUtilities();
    const date = new Date("2024-01-01T00:00:00Z");
    const formattedDate = utilities.formatDate(
      date,
      "Asia/Tokyo",
      "yyyy/MM/dd HH:mm:ss",
    );
    expect(formattedDate).toBe("2024/01/01 09:00:00");
  });

  it("'2024-01-01T00:00:00Z'をAsia/Tokyoで'yyyy年MM月dd日 HH時mm分ss秒'フォーマットすると、'2024年01月01日 09時00分00秒'になる", () => {
    const utilities = new NodeUtilities();
    const date = new Date("2024-01-01T00:00:00Z");
    const formattedDate = utilities.formatDate(
      date,
      "Asia/Tokyo",
      "yyyy年MM月dd日 HH時mm分ss秒",
    );
    expect(formattedDate).toBe("2024年01月01日 09時00分00秒");
  });
});

describe("文字列のフォーマット", () => {
  it("'Hello, {0}!'を'World'でフォーマットすると、'Hello, {0}!'になる", () => {
    const utilities = new NodeUtilities();
    const formattedString = utilities.formatString("Hello, {0}!", "World");
    expect(formattedString).toBe("Hello, {0}!");
  });

  it("'The numbers are {0}, {1}, and {2}.'を1, 2, 3でフォーマットすると、'The numbers are {0}, {1}, and {2}.'になる", () => {
    const utilities = new NodeUtilities();
    const formattedString = utilities.formatString(
      "The numbers are {0}, {1}, and {2}.",
      1,
      2,
      3,
    );
    expect(formattedString).toBe("The numbers are {0}, {1}, and {2}.");
  });

  it("'Hello, %s!'を'World'でフォーマットすると、'Hello, World!'になる", () => {
    const utilities = new NodeUtilities();
    const formattedString = utilities.formatString("Hello, %s!", "World");
    expect(formattedString).toBe("Hello, World!");
  });

  it("'The numbers are %d, %d, and %d.'を1, 2, 3でフォーマットすると、'The numbers are 1, 2, and 3.'になる", () => {
    const utilities = new NodeUtilities();
    const formattedString = utilities.formatString(
      "The numbers are %d, %d, and %d.",
      1,
      2,
      3,
    );
    expect(formattedString).toBe("The numbers are 1, 2, and 3.");
  });
});

describe("ダイジェストの計算", () => {
  describe("MD2アルゴリズムで", () => {
    it("テストデータを文字コード未指定でダイジェスト化すると、'[ 105, 109, 43, -10, -31, 63, 16, -120, 73, 73, 23, 98, 24, -83, -102, -47 ]'になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.MD2,
        "テストデータ",
      );
      expect(digest).toEqual([
        105, 109, 43, -10, -31, 63, 16, -120, 73, 73, 23, 98, 24, -83, -102,
        -47,
      ]);
    });

    it("テストデータをUTF-8でダイジェスト化すると、'[ 119, 52, -77, -14, 108, 55, -55, 25, -20, -28, 15, 23, 11, 100, -25, 42 ]'になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.MD2,
        "テストデータ",
        utilities.Charset.UTF_8,
      );
      expect(digest).toEqual([
        119, 52, -77, -14, 108, 55, -55, 25, -20, -28, 15, 23, 11, 100, -25, 42,
      ]);
    });
  });

  describe("MD5アルゴリズムで", () => {
    it("テストデータをUTF-8でダイジェスト化すると、'[ 16,-13,-93,-116,-117,-72,-122,87,-119,-128,-1,-98,4,-128,-7,-59 ]'になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.MD5,
        "テストデータ",
        utilities.Charset.UTF_8,
      );
      expect(digest).toEqual([
        16, -13, -93, -116, -117, -72, -122, 87, -119, -128, -1, -98, 4, -128,
        -7, -59,
      ]);
    });

    it("テストデータを文字コード未指定でダイジェスト化すると、'[ -33, 100, -36, 46, -76, -96, -72, 80, -111, -35, 49, -21, 73, 35, -22, -84 ]'になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.MD5,
        "テストデータ",
      );
      expect(digest).toEqual([
        -33, 100, -36, 46, -76, -96, -72, 80, -111, -35, 49, -21, 73, 35, -22,
        -84,
      ]);
    });
  });

  describe("SHA-1アルゴリズムで", () => {
    it("テストデータを文字コード未指定でダイジェスト化すると、[ 0,2,107,-123,-22,21,-92,-61,8,98,58,-123,62,-50,106,82,17,-94,-9,49 ]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_1,
        "テストデータ",
      );

      expect(digest).toEqual([
        0, 2, 107, -123, -22, 21, -92, -61, 8, 98, 58, -123, 62, -50, 106, 82,
        17, -94, -9, 49,
      ]);
    });

    it("テストデータをUTF-8でダイジェスト化すると、[ 102,60,53,0,-62,-56,102,125,-27,-104,-110,85,-105,79,-88,88,-118,47,48,-30 ]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_1,
        "テストデータ",
        utilities.Charset.UTF_8,
      );

      expect(digest).toEqual([
        102, 60, 53, 0, -62, -56, 102, 125, -27, -104, -110, 85, -105, 79, -88,
        88, -118, 47, 48, -30,
      ]);
    });
  });

  describe("SHA-256アルゴリズムで", () => {
    it("テストデータを文字コード未指定でダイジェスト化すると、[ 44,11,78,-30,-96,60,67,78,24,86,64,77,3,-43,123,-126,-56,-17,80,2,55,-66,-118,-31,24,-79,20,122,16,81,-43,-74 ]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_256,
        "テストデータ",
      );

      expect(digest).toEqual([
        44, 11, 78, -30, -96, 60, 67, 78, 24, 86, 64, 77, 3, -43, 123, -126,
        -56, -17, 80, 2, 55, -66, -118, -31, 24, -79, 20, 122, 16, 81, -43, -74,
      ]);
    });

    it("テストデータをUTF-8でダイジェスト化すると、[-113, 105, 4, 118, 87, 33, 115, 39, -46, -126, -87, -105, -52, 58, -16, 51,-11, -113, 105, -30, 71, 24, 13, -62, -61, 43, 79, 62, -4, -52, -81, -38,]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_256,
        "テストデータ",
        utilities.Charset.UTF_8,
      );

      expect(digest).toEqual([
        -113, 105, 4, 118, 87, 33, 115, 39, -46, -126, -87, -105, -52, 58, -16,
        51, -11, -113, 105, -30, 71, 24, 13, -62, -61, 43, 79, 62, -4, -52, -81,
        -38,
      ]);
    });
  });

  describe("SHA-384アルゴリズムで", () => {
    it("テストデータを文字コード未指定でダイジェスト化すると、[-96, 2, 9, 110, 123, 21, 122, 64, 95, 31, 104, -36, 31, -23, -90, -85, 37,114, 12, 46, -10, 26, -39, -70, -56, 121, -95, -52, -3, -4, 118, 120, -73,112, -51, -113, -63, 49, 32, -20, -36, 52, 89, 102, -96, 89, -11, 38,]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_384,
        "テストデータ",
      );

      expect(digest).toEqual([
        -96, 2, 9, 110, 123, 21, 122, 64, 95, 31, 104, -36, 31, -23, -90, -85,
        37, 114, 12, 46, -10, 26, -39, -70, -56, 121, -95, -52, -3, -4, 118,
        120, -73, 112, -51, -113, -63, 49, 32, -20, -36, 52, 89, 102, -96, 89,
        -11, 38,
      ]);
    });

    it("テストデータをUTF-8でダイジェスト化すると、[15, -48, -61, 119, -59, 40, -60, 35, 93, 91, -64, -118, -58, 42, 25, 45,-37, -104, 15, -48, -27, 60, -61, -9, -91, -9, 42, -1, -108, -125, -111,-51, -30, 3, 27, 94, 11, 101, 91, -2, -28, -24, -74, -75, 95, -27, 33, -15,]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_384,
        "テストデータ",
        utilities.Charset.UTF_8,
      );

      expect(digest).toEqual([
        15, -48, -61, 119, -59, 40, -60, 35, 93, 91, -64, -118, -58, 42, 25, 45,
        -37, -104, 15, -48, -27, 60, -61, -9, -91, -9, 42, -1, -108, -125, -111,
        -51, -30, 3, 27, 94, 11, 101, 91, -2, -28, -24, -74, -75, 95, -27, 33,
        -15,
      ]);
    });
  });

  describe("SHA-512アルゴリズムで", () => {
    it("テストデータを文字コード未指定でダイジェスト化すると、[-35, -107, 123, 1, 91, 70, 49, -48, -106, -65, -100, 16, 126, -28, 119, 99,28, 122, -16, -25, -124, 94, -60, 120, -85, 73, -50, -43, 111, -67, 95,-128, -60, 120, -68, -16, -75, -28, 102, 36, 104, 89, -5, 12, 108, 112, -34,-2, 2, 114, 43, 3, -117, -14, 63, -2, 11, -51, -1, 6, 82, -107, -68, 36,]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_512,
        "テストデータ",
      );

      expect(digest).toEqual([
        -35, -107, 123, 1, 91, 70, 49, -48, -106, -65, -100, 16, 126, -28, 119,
        99, 28, 122, -16, -25, -124, 94, -60, 120, -85, 73, -50, -43, 111, -67,
        95, -128, -60, 120, -68, -16, -75, -28, 102, 36, 104, 89, -5, 12, 108,
        112, -34, -2, 2, 114, 43, 3, -117, -14, 63, -2, 11, -51, -1, 6, 82,
        -107, -68, 36,
      ]);
    });

    it("テストデータをUTF-8でダイジェスト化すると、[99, -50, 70, -14, -93, 120, -65, -109, 43, 95, 39, 54, 96, 98, -120, 33, 29,66, -51, 17, 110, -52, 2, 106, 63, 92, -15, -20, -51, 43, -8, 36, 77, -6,-60, -39, -23, 93, 90, -6, 93, 22, -45, 90, -13, -102, 70, -123, 81, 18,-23, 54, 69, 48, 6, 40, -98, -83, 18, 98, -40, 120, 52, 2,]になる", () => {
      const utilities = new NodeUtilities();
      const digest = utilities.computeDigest(
        utilities.DigestAlgorithm.SHA_512,
        "テストデータ",
        utilities.Charset.UTF_8,
      );

      expect(digest).toEqual([
        99, -50, 70, -14, -93, 120, -65, -109, 43, 95, 39, 54, 96, 98, -120, 33,
        29, 66, -51, 17, 110, -52, 2, 106, 63, 92, -15, -20, -51, 43, -8, 36,
        77, -6, -60, -39, -23, 93, 90, -6, 93, 22, -45, 90, -13, -102, 70, -123,
        81, 18, -23, 54, 69, 48, 6, 40, -98, -83, 18, 98, -40, 120, 52, 2,
      ]);
    });
  });

  describe("対応していないアルゴリズムを指定すると、例外がスローされる", () => {
    it("MD2以外のアルゴリズムが実行環境で未対応の場合、エラーになる", () => {
      vi.spyOn(Algorithm.prototype, "isSupported").mockReturnValue(false);

      const utilities = new NodeUtilities();

      expect(() =>
        utilities.computeDigest(
          utilities.DigestAlgorithm.SHA_256,
          "test",
          utilities.Charset.UTF_8,
        ),
      ).toThrow(
        "The specified digest algorithm is not supported in this environment: sha256",
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });
  });
});

describe("HMAC署名の計算", () => {
  describe("HMAC-MD5アルゴリズムで", () => {
    it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[ -69,-128,93,-6,-48,111,-11,-77,-92,-127,13,-25,93,-42,-100,11 ]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_MD5,
        "テストデータ",
        "AppsScript",
      );
      expect(signature).toEqual([
        -69, -128, 93, -6, -48, 111, -11, -77, -92, -127, 13, -25, 93, -42,
        -100, 11,
      ]);
    });

    it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[-102, -104, 95, 93, -60, 102, -77, 35, -111, 18, -100, 4, -100, -120, 47, -52]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_MD5,
        "テストデータ",
        "AppsScript",
        utilities.Charset.UTF_8,
      );
      expect(signature).toEqual([
        -102, -104, 95, 93, -60, 102, -77, 35, -111, 18, -100, 4, -100, -120,
        47, -52,
      ]);
    });
  });

  describe("HMAC-SHA1アルゴリズムで", () => {
    it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[126, 117, 99, 65, 26, 119, 33, -113, -40, -43, -37, 17, 86, -72, 24, -80,-1, 126, 62, -87,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_1,
        "テストデータ",
        "AppsScript",
        utilities.Charset.UTF_8,
      );
      expect(signature).toEqual([
        126, 117, 99, 65, 26, 119, 33, -113, -40, -43, -37, 17, 86, -72, 24,
        -80, -1, 126, 62, -87,
      ]);
    });

    it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[89, -6, -3, 66, -27, -126, 14, 42, -70, 32, 60, 123, 99, -110, 121, -84, 44,-55, -92, -5,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_1,
        "テストデータ",
        "AppsScript",
      );
      expect(signature).toEqual([
        89, -6, -3, 66, -27, -126, 14, 42, -70, 32, 60, 123, 99, -110, 121, -84,
        44, -55, -92, -5,
      ]);
    });
  });

  describe("HMAC-SHA256アルゴリズムで", () => {
    it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[79, 86, 32, -33, 26, 3, -87, -7, 41, -27, 82, 104, 37, 78, -24, 127, -23,125, -23, 50, -98, 88, 37, -64, -114, -3, 109, -94, -116, -31, -89, 72,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_256,
        "テストデータ",
        "AppsScript",
        utilities.Charset.UTF_8,
      );
      expect(signature).toEqual([
        79, 86, 32, -33, 26, 3, -87, -7, 41, -27, 82, 104, 37, 78, -24, 127,
        -23, 125, -23, 50, -98, 88, 37, -64, -114, -3, 109, -94, -116, -31, -89,
        72,
      ]);
    });

    it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[-79, -36, -85, -106, 23, 20, -6, 18, 28, 68, -16, -47, -1, 81, 19, 67, -72,6, -99, 1, -107, 59, -10, -114, -11, 116, -10, 66, 92, -78, 13, -75,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_256,
        "テストデータ",
        "AppsScript",
      );
      expect(signature).toEqual([
        -79, -36, -85, -106, 23, 20, -6, 18, 28, 68, -16, -47, -1, 81, 19, 67,
        -72, 6, -99, 1, -107, 59, -10, -114, -11, 116, -10, 66, 92, -78, 13,
        -75,
      ]);
    });
  });

  describe("HMAC-SHA384アルゴリズムで", () => {
    it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[-29, -55, -47, -58, 60, -41, 119, -94, -21, -107, -114, -87, -119, 15, -108,-45, -52, -128, 54, -68, -73, -32, 6, 108, 14, 15, -114, 23, -112, 121,-111, -33, -122, -84, 79, -37, 3, -98, -20, -71, 126, 90, 53, -105, 113, 7,-82, 96,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_384,
        "テストデータ",
        "AppsScript",
        utilities.Charset.UTF_8,
      );
      expect(signature).toEqual([
        -29, -55, -47, -58, 60, -41, 119, -94, -21, -107, -114, -87, -119, 15,
        -108, -45, -52, -128, 54, -68, -73, -32, 6, 108, 14, 15, -114, 23, -112,
        121, -111, -33, -122, -84, 79, -37, 3, -98, -20, -71, 126, 90, 53, -105,
        113, 7, -82, 96,
      ]);
    });

    it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[-59, -40, -28, -22, 124, 50, 16, -104, 92, 47, -55, -25, 24, 36, -43, -88,-77, -14, 111, -25, -44, 113, -29, -13, -95, 56, -42, -94, -59, -86, -26,-53, 8, -76, -10, -118, -102, 19, 126, -110, -50, 124, -59, 79, 76, 124,-86, -112,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_384,
        "テストデータ",
        "AppsScript",
      );
      expect(signature).toEqual([
        -59, -40, -28, -22, 124, 50, 16, -104, 92, 47, -55, -25, 24, 36, -43,
        -88, -77, -14, 111, -25, -44, 113, -29, -13, -95, 56, -42, -94, -59,
        -86, -26, -53, 8, -76, -10, -118, -102, 19, 126, -110, -50, 124, -59,
        79, 76, 124, -86, -112,
      ]);
    });
  });

  describe("HMAC-SHA512アルゴリズムで", () => {
    it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[-17, -126, 106, -116, 5, 116, -99, -5, -17, -104, 63, -8, -15, 44, 109, -50,120, -108, -66, 22, 48, 1, 12, 57, 27, 74, -55, -38, -121, 116, -60, 83,-100, 24, -124, 67, -110, -45, 108, 30, 55, 115, -5, 72, -71, -101, -97,-76, 127, -27, -77, -113, -23, 88, -122, -20, 58, 33, 111, -126, 39, 104,57, 2,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_512,
        "テストデータ",
        "AppsScript",
        utilities.Charset.UTF_8,
      );
      expect(signature).toEqual([
        -17, -126, 106, -116, 5, 116, -99, -5, -17, -104, 63, -8, -15, 44, 109,
        -50, 120, -108, -66, 22, 48, 1, 12, 57, 27, 74, -55, -38, -121, 116,
        -60, 83, -100, 24, -124, 67, -110, -45, 108, 30, 55, 115, -5, 72, -71,
        -101, -97, -76, 127, -27, -77, -113, -23, 88, -122, -20, 58, 33, 111,
        -126, 39, 104, 57, 2,
      ]);
    });

    it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[-52, 86, -51, -119, -14, 62, 43, -26, -120, -31, 52, -91, 38, -97, 18, 31,86, -124, 48, 114, -109, -59, 103, -114, -69, -1, -122, 22, -109, 30, -71,-47, -108, 115, 118, -7, -9, 68, -13, 102, -41, -119, -16, 74, -61, -26,114, -31, 71, -8, 35, 82, 41, 86, 81, -33, 34, 15, 63, -69, -20, -99, -40,9,]'になる", () => {
      const utilities = new NodeUtilities();
      const signature = utilities.computeHmacSignature(
        utilities.MacAlgorithm.HMAC_SHA_512,
        "テストデータ",
        "AppsScript",
      );
      expect(signature).toEqual([
        -52, 86, -51, -119, -14, 62, 43, -26, -120, -31, 52, -91, 38, -97, 18,
        31, 86, -124, 48, 114, -109, -59, 103, -114, -69, -1, -122, 22, -109,
        30, -71, -47, -108, 115, 118, -7, -9, 68, -13, 102, -41, -119, -16, 74,
        -61, -26, 114, -31, 71, -8, 35, 82, 41, 86, 81, -33, 34, 15, 63, -69,
        -20, -99, -40, 9,
      ]);
    });
  });
});

describe("SHA256によるHMAC署名", () => {
  it("テストデータをUTF-8でキー'AppsScript'でHMAC署名すると、'[79, 86, 32, -33, 26, 3, -87, -7, 41, -27, 82, 104, 37, 78, -24, 127, -23,125, -23, 50, -98, 88, 37, -64, -114, -3, 109, -94, -116, -31, -89, 72,]'になる", () => {
    const utilities = new NodeUtilities();
    const signature = utilities.computeHmacSha256Signature(
      "テストデータ",
      "AppsScript",
      utilities.Charset.UTF_8,
    );
    expect(signature).toEqual([
      79, 86, 32, -33, 26, 3, -87, -7, 41, -27, 82, 104, 37, 78, -24, 127, -23,
      125, -23, 50, -98, 88, 37, -64, -114, -3, 109, -94, -116, -31, -89, 72,
    ]);
  });

  it("テストデータを文字コードを指定せずにキー'AppsScript'でHMAC署名すると、'[-79, -36, -85, -106, 23, 20, -6, 18, 28, 68, -16, -47, -1, 81, 19, 67, -72,6, -99, 1, -107, 59, -10, -114, -11, 116, -10, 66, 92, -78, 13, -75,]'になる", () => {
    const utilities = new NodeUtilities();
    const signature = utilities.computeHmacSha256Signature(
      "テストデータ",
      "AppsScript",
    );
    expect(signature).toEqual([
      -79, -36, -85, -106, 23, 20, -6, 18, 28, 68, -16, -47, -1, 81, 19, 67,
      -72, 6, -99, 1, -107, 59, -10, -114, -11, 116, -10, 66, 92, -78, 13, -75,
    ]);
  });
});

describe("RSA署名", () => {
  describe("ハッシュアルゴリズムがSHA-1のとき", () => {
    it("テストデータを文字コード未指定で秘密鍵で署名すると、任意の配列になる", () => {
      const utilities = new NodeUtilities();
      const privateKey = fs.readFileSync(
        path.join(__dirname, "private_key.pem"),
        "ascii",
      );
      const signature = utilities.computeRsaSignature(
        utilities.RsaAlgorithm.RSA_SHA_1,
        "テストデータ",
        privateKey,
      );

      expect(signature).toEqual([
        64, 107, 103, 71, 43, -35, 39, -27, -74, 19, -44, 101, 65, 19, 39, 24,
        70, 96, -95, -74, 69, -97, 77, 34, 32, 19, -93, -127, 56, 40, 46, 65,
        -125, -128, 54, 115, 9, -15, 113, 87, 64, -52, 51, 61, 26, -95, 120,
        -69, -49, 35, 22, -30, -119, -55, -1, 101, -70, 19, 57, -83, 79, 74, 19,
        31, 8, -114, 34, -80, -92, -119, 35, 80, -65, -29, 21, 120, -89, -116,
        -101, 10, 15, 13, -47, -54, 104, -2, 19, -2, 51, -25, -11, 5, 109, -119,
        -89, 1, 127, -8, 72, -50, -32, -56, 111, -86, 94, -71, 22, -4, 112, -49,
        58, -115, -118, 13, -103, 13, -93, -113, 91, -95, 91, -21, 84, 12, -38,
        -86, 57, 52, 5, -22, -110, -94, -30, 86, 44, -103, -124, -72, 76, -102,
        -8, -10, 6, -54, -70, 89, -89, -55, -31, 4, 35, 2, 126, 12, -65, 44, 82,
        -82, -98, 59, -74, 75, 97, -126, -59, 62, -100, 74, -15, -67, -40, 54,
        -57, -125, -100, 114, -90, 112, 64, 79, 109, -88, -79, 21, -81, 104, -1,
        -19, -127, -80, 49, -104, -119, 15, 104, -17, 26, -122, 53, 64, -36,
        -29, 107, 81, 53, -102, 62, -73, -14, -39, 105, 76, 4, 62, 82, 53, 27,
        -21, -103, 30, 13, -13, 2, -40, 43, 42, 53, -24, -21, 12, -85, 78, 69,
        -98, 79, 102, 0, 86, -7, -12, 5, 25, 56, 0, -12, 30, -30, -22, 18, -99,
        -11, -4, 121, -72, 77, 90,
      ]);
    });

    it("テストデータをUTF-8で秘密鍵で署名すると、任意の配列になる", () => {
      const utilities = new NodeUtilities();
      const privateKey = fs.readFileSync(
        path.join(__dirname, "private_key.pem"),
        "ascii",
      );
      const signature = utilities.computeRsaSignature(
        utilities.RsaAlgorithm.RSA_SHA_1,
        "テストデータ",
        privateKey,
        utilities.Charset.UTF_8,
      );

      expect(signature).toEqual([
        14, -71, -48, -51, 114, -18, -103, 53, -31, 18, 116, -60, -59, -101,
        -110, 68, 90, 29, -9, -66, 56, 86, -79, 11, 102, 85, 39, 47, -112, 36,
        -6, 98, 42, 99, 64, 46, -33, 92, 65, -7, 49, 25, -9, 117, -102, -22,
        107, -82, -86, 14, -98, 85, 98, 81, 105, 23, 5, -13, 127, 45, -59, 111,
        -63, 26, -1, 122, 77, 98, 50, 44, -24, 108, -46, -69, 56, 45, -23, -69,
        72, 126, 121, 59, -26, -86, -56, 38, -1, -52, 31, -100, -8, -41, 17,
        -22, -91, -59, -65, 35, 37, -9, 63, 70, 21, 55, 69, 64, 119, 20, -109,
        29, -106, 78, -54, 12, 2, -104, -47, -15, -33, -56, -46, 41, 85, 54, 55,
        49, -114, -123, 44, 75, -23, -123, -3, 106, -50, 90, 120, -90, -75, 50,
        -86, 1, -108, 86, -18, -45, -46, 87, 69, -120, 30, 43, 118, -83, -60,
        123, 110, 108, 120, -55, -20, 61, 48, -127, -53, 55, -27, -43, 39, -118,
        54, -40, 43, -87, 121, 109, -50, 119, -89, 123, -12, -4, -3, 49, -63,
        62, 110, -6, -121, -114, 101, -15, -105, 88, -23, -83, 33, -88, -120,
        -111, -30, -63, 37, 99, -108, 86, -7, -2, -59, -60, 76, -25, 18, 66,
        -95, 23, -116, 94, 74, -36, 49, -37, -10, -128, -33, 92, 29, 82, 74, -3,
        -53, 17, 59, 104, 27, -52, -4, -43, 117, 103, 0, 40, 58, 54, -57, 115,
        -30, 0, 76, -121, -27, 63, -13, -119, 25, -13,
      ]);
    });
  });

  describe("ハッシュアルゴリズムがSHA-256のとき", () => {
    it("テストデータを文字コード未指定で秘密鍵で署名すると、任意の配列になる", () => {
      const utilities = new NodeUtilities();
      const privateKey = fs.readFileSync(
        path.join(__dirname, "private_key.pem"),
        "ascii",
      );
      const signature = utilities.computeRsaSignature(
        utilities.RsaAlgorithm.RSA_SHA_256,
        "テストデータ",
        privateKey,
      );

      expect(signature).toEqual([
        -114, 7, 4, -6, -97, 115, 100, -63, -80, 70, 24, -115, -61, -64, -9,
        123, -32, -62, 31, -33, -109, -22, -21, 113, 63, -34, 57, -33, -5, -12,
        -68, 65, -76, -8, -50, 62, 24, 47, 116, -59, 119, -63, 68, 12, -48, 120,
        104, 91, -59, 79, -119, 54, -126, 120, -88, -118, 110, 11, -39, 9, -75,
        -128, 45, 90, 122, -68, -14, 44, 62, -12, -18, -28, 99, -65, -117, -44,
        -103, 118, -48, -54, 34, 1, 76, 68, -51, -66, 56, -43, -44, -55, 23, 63,
        -24, -6, -101, 96, 97, 55, -113, 86, 37, -16, -3, 33, 89, 33, 50, -35,
        -25, 106, -99, -118, -96, -37, -61, 123, 110, 75, 98, -52, -21, 4, -72,
        10, -108, 0, -100, -73, -16, 14, -39, 71, 31, -38, 125, -21, 21, 64,
        -73, -37, -98, 82, 87, -49, -8, 109, -118, 47, 119, 50, 57, -56, 29, 25,
        41, 93, -104, 32, 79, -67, 26, 6, -26, 81, 78, -82, -41, 75, -16, -38,
        117, -13, 121, 62, 81, 100, -85, -114, -11, -98, 125, -117, -81, 60,
        -10, -25, 29, -13, -73, 34, 19, -17, -11, 99, 26, -121, -107, -22, -98,
        46, 127, -85, 22, -46, -36, -24, 102, 98, -16, -92, -13, -84, -95, -2,
        64, 31, -80, -111, -85, 6, 112, 81, 56, 93, -101, -37, -34, -95, -47,
        91, -57, -125, 103, 13, 69, -116, 14, 11, -63, -11, 94, 111, -78, -6,
        -19, -47, 31, 125, -29, 59, 90, -7, -107, 46, -88, 113,
      ]);
    });

    it("テストデータをUTF-8で秘密鍵で署名すると、任意の配列になる", () => {
      const utilities = new NodeUtilities();
      const privateKey = fs.readFileSync(
        path.join(__dirname, "private_key.pem"),
        "ascii",
      );
      const signature = utilities.computeRsaSignature(
        utilities.RsaAlgorithm.RSA_SHA_256,
        "テストデータ",
        privateKey,
        utilities.Charset.UTF_8,
      );

      expect(signature).toEqual([
        39, 73, 36, -3, -76, 122, 22, -1, 115, 63, -90, -114, -114, 95, -3, -4,
        23, -51, -94, -123, 9, -8, 19, -22, 119, -32, -3, 67, -109, -116, 19,
        -77, -118, 97, -123, -124, 96, 35, -46, -34, -48, -32, -94, -9, 26, 48,
        126, 27, -6, -73, -9, -121, 83, 112, 17, -86, 4, -52, -102, 66, 70, -37,
        -19, 26, -72, 103, -30, 3, 126, 75, 103, 70, 70, 116, -67, -101, 43, 43,
        6, 81, 20, 92, -121, -19, -91, -113, 52, -78, -127, 41, -3, -20, -24,
        118, -122, 48, 39, 8, -38, 50, 41, 35, 82, 34, -116, -120, -67, 34,
        -107, 32, 49, 40, -62, -26, -76, 28, -101, -102, -116, 0, 94, -54, -7,
        28, -118, 49, -103, 40, 108, 116, 68, 64, -128, -114, -58, 45, 60, 26,
        -25, 83, 52, -101, -9, -108, 49, -8, -14, -89, -2, 52, -11, 34, 63, 95,
        47, -74, 97, -115, -31, -114, -42, 42, -11, -122, -11, 126, -43, 44,
        -47, 74, -98, 80, -4, 127, 57, 122, 78, 97, -38, 118, 71, 85, 78, -79,
        48, -54, 112, -8, -16, -126, -71, -68, 96, -78, -113, 53, -106, 60, 29,
        -16, -54, 12, 91, -28, 2, -75, -56, -45, -104, 4, -64, 87, -125, -17,
        -115, -112, 63, -23, 122, 68, -59, -80, -103, 67, 2, 91, -61, -66, 9,
        -91, -16, 99, 43, -30, -39, 6, -63, -124, 20, -43, 68, -93, -108, 46,
        14, -96, -103, -42, -103, 114, -54, 68, 63, -121, -63, 71,
      ]);
    });
  });
});

describe("SHA1によるRSA署名", () => {
  it("テストデータを文字コード未指定で秘密鍵で署名すると、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const privateKey = fs.readFileSync(
      path.join(__dirname, "private_key.pem"),
      "ascii",
    );
    const signature = utilities.computeRsaSha1Signature(
      "テストデータ",
      privateKey,
    );

    expect(signature).toEqual([
      64, 107, 103, 71, 43, -35, 39, -27, -74, 19, -44, 101, 65, 19, 39, 24, 70,
      96, -95, -74, 69, -97, 77, 34, 32, 19, -93, -127, 56, 40, 46, 65, -125,
      -128, 54, 115, 9, -15, 113, 87, 64, -52, 51, 61, 26, -95, 120, -69, -49,
      35, 22, -30, -119, -55, -1, 101, -70, 19, 57, -83, 79, 74, 19, 31, 8,
      -114, 34, -80, -92, -119, 35, 80, -65, -29, 21, 120, -89, -116, -101, 10,
      15, 13, -47, -54, 104, -2, 19, -2, 51, -25, -11, 5, 109, -119, -89, 1,
      127, -8, 72, -50, -32, -56, 111, -86, 94, -71, 22, -4, 112, -49, 58, -115,
      -118, 13, -103, 13, -93, -113, 91, -95, 91, -21, 84, 12, -38, -86, 57, 52,
      5, -22, -110, -94, -30, 86, 44, -103, -124, -72, 76, -102, -8, -10, 6,
      -54, -70, 89, -89, -55, -31, 4, 35, 2, 126, 12, -65, 44, 82, -82, -98, 59,
      -74, 75, 97, -126, -59, 62, -100, 74, -15, -67, -40, 54, -57, -125, -100,
      114, -90, 112, 64, 79, 109, -88, -79, 21, -81, 104, -1, -19, -127, -80,
      49, -104, -119, 15, 104, -17, 26, -122, 53, 64, -36, -29, 107, 81, 53,
      -102, 62, -73, -14, -39, 105, 76, 4, 62, 82, 53, 27, -21, -103, 30, 13,
      -13, 2, -40, 43, 42, 53, -24, -21, 12, -85, 78, 69, -98, 79, 102, 0, 86,
      -7, -12, 5, 25, 56, 0, -12, 30, -30, -22, 18, -99, -11, -4, 121, -72, 77,
      90,
    ]);
  });

  it("テストデータをUTF-8で秘密鍵で署名すると、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const privateKey = fs.readFileSync(
      path.join(__dirname, "private_key.pem"),
      "ascii",
    );
    const signature = utilities.computeRsaSha1Signature(
      "テストデータ",
      privateKey,
      utilities.Charset.UTF_8,
    );

    expect(signature).toEqual([
      14, -71, -48, -51, 114, -18, -103, 53, -31, 18, 116, -60, -59, -101, -110,
      68, 90, 29, -9, -66, 56, 86, -79, 11, 102, 85, 39, 47, -112, 36, -6, 98,
      42, 99, 64, 46, -33, 92, 65, -7, 49, 25, -9, 117, -102, -22, 107, -82,
      -86, 14, -98, 85, 98, 81, 105, 23, 5, -13, 127, 45, -59, 111, -63, 26, -1,
      122, 77, 98, 50, 44, -24, 108, -46, -69, 56, 45, -23, -69, 72, 126, 121,
      59, -26, -86, -56, 38, -1, -52, 31, -100, -8, -41, 17, -22, -91, -59, -65,
      35, 37, -9, 63, 70, 21, 55, 69, 64, 119, 20, -109, 29, -106, 78, -54, 12,
      2, -104, -47, -15, -33, -56, -46, 41, 85, 54, 55, 49, -114, -123, 44, 75,
      -23, -123, -3, 106, -50, 90, 120, -90, -75, 50, -86, 1, -108, 86, -18,
      -45, -46, 87, 69, -120, 30, 43, 118, -83, -60, 123, 110, 108, 120, -55,
      -20, 61, 48, -127, -53, 55, -27, -43, 39, -118, 54, -40, 43, -87, 121,
      109, -50, 119, -89, 123, -12, -4, -3, 49, -63, 62, 110, -6, -121, -114,
      101, -15, -105, 88, -23, -83, 33, -88, -120, -111, -30, -63, 37, 99, -108,
      86, -7, -2, -59, -60, 76, -25, 18, 66, -95, 23, -116, 94, 74, -36, 49,
      -37, -10, -128, -33, 92, 29, 82, 74, -3, -53, 17, 59, 104, 27, -52, -4,
      -43, 117, 103, 0, 40, 58, 54, -57, 115, -30, 0, 76, -121, -27, 63, -13,
      -119, 25, -13,
    ]);
  });
});

describe("SHA256によるRSA署名", () => {
  it("テストデータを文字コード未指定で秘密鍵で署名すると、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const privateKey = fs.readFileSync(
      path.join(__dirname, "private_key.pem"),
      "ascii",
    );
    const signature = utilities.computeRsaSignature(
      utilities.RsaAlgorithm.RSA_SHA_256,
      "テストデータ",
      privateKey,
    );

    expect(signature).toEqual([
      -114, 7, 4, -6, -97, 115, 100, -63, -80, 70, 24, -115, -61, -64, -9, 123,
      -32, -62, 31, -33, -109, -22, -21, 113, 63, -34, 57, -33, -5, -12, -68,
      65, -76, -8, -50, 62, 24, 47, 116, -59, 119, -63, 68, 12, -48, 120, 104,
      91, -59, 79, -119, 54, -126, 120, -88, -118, 110, 11, -39, 9, -75, -128,
      45, 90, 122, -68, -14, 44, 62, -12, -18, -28, 99, -65, -117, -44, -103,
      118, -48, -54, 34, 1, 76, 68, -51, -66, 56, -43, -44, -55, 23, 63, -24,
      -6, -101, 96, 97, 55, -113, 86, 37, -16, -3, 33, 89, 33, 50, -35, -25,
      106, -99, -118, -96, -37, -61, 123, 110, 75, 98, -52, -21, 4, -72, 10,
      -108, 0, -100, -73, -16, 14, -39, 71, 31, -38, 125, -21, 21, 64, -73, -37,
      -98, 82, 87, -49, -8, 109, -118, 47, 119, 50, 57, -56, 29, 25, 41, 93,
      -104, 32, 79, -67, 26, 6, -26, 81, 78, -82, -41, 75, -16, -38, 117, -13,
      121, 62, 81, 100, -85, -114, -11, -98, 125, -117, -81, 60, -10, -25, 29,
      -13, -73, 34, 19, -17, -11, 99, 26, -121, -107, -22, -98, 46, 127, -85,
      22, -46, -36, -24, 102, 98, -16, -92, -13, -84, -95, -2, 64, 31, -80,
      -111, -85, 6, 112, 81, 56, 93, -101, -37, -34, -95, -47, 91, -57, -125,
      103, 13, 69, -116, 14, 11, -63, -11, 94, 111, -78, -6, -19, -47, 31, 125,
      -29, 59, 90, -7, -107, 46, -88, 113,
    ]);
  });

  it("テストデータをUTF-8で秘密鍵で署名すると、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const privateKey = fs.readFileSync(
      path.join(__dirname, "private_key.pem"),
      "ascii",
    );
    const signature = utilities.computeRsaSignature(
      utilities.RsaAlgorithm.RSA_SHA_256,
      "テストデータ",
      privateKey,
      utilities.Charset.UTF_8,
    );

    expect(signature).toEqual([
      39, 73, 36, -3, -76, 122, 22, -1, 115, 63, -90, -114, -114, 95, -3, -4,
      23, -51, -94, -123, 9, -8, 19, -22, 119, -32, -3, 67, -109, -116, 19, -77,
      -118, 97, -123, -124, 96, 35, -46, -34, -48, -32, -94, -9, 26, 48, 126,
      27, -6, -73, -9, -121, 83, 112, 17, -86, 4, -52, -102, 66, 70, -37, -19,
      26, -72, 103, -30, 3, 126, 75, 103, 70, 70, 116, -67, -101, 43, 43, 6, 81,
      20, 92, -121, -19, -91, -113, 52, -78, -127, 41, -3, -20, -24, 118, -122,
      48, 39, 8, -38, 50, 41, 35, 82, 34, -116, -120, -67, 34, -107, 32, 49, 40,
      -62, -26, -76, 28, -101, -102, -116, 0, 94, -54, -7, 28, -118, 49, -103,
      40, 108, 116, 68, 64, -128, -114, -58, 45, 60, 26, -25, 83, 52, -101, -9,
      -108, 49, -8, -14, -89, -2, 52, -11, 34, 63, 95, 47, -74, 97, -115, -31,
      -114, -42, 42, -11, -122, -11, 126, -43, 44, -47, 74, -98, 80, -4, 127,
      57, 122, 78, 97, -38, 118, 71, 85, 78, -79, 48, -54, 112, -8, -16, -126,
      -71, -68, 96, -78, -113, 53, -106, 60, 29, -16, -54, 12, 91, -28, 2, -75,
      -56, -45, -104, 4, -64, 87, -125, -17, -115, -112, 63, -23, 122, 68, -59,
      -80, -103, 67, 2, 91, -61, -66, 9, -91, -16, 99, 43, -30, -39, 6, -63,
      -124, 20, -43, 68, -93, -108, 46, 14, -96, -103, -42, -103, 114, -54, 68,
      63, -121, -63, 71,
    ]);
  });
});

describe("gzip圧縮", () => {
  it("テストデータをBlobにしてgzip圧縮すると、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const data = new InMemoryBlob("テストデータ");
    const compressedData = utilities.gzip(data);
    expect(compressedData.getBytes()).toEqual([
      31, -117, 8, 0, 0, 0, 0, 0, 0, -1, 123, -36, -36, -10, -72, 105, -25, -29,
      -26, -114, -57, -51, -19, -113, -101, -9, 60, 110, -38, 15, 0, 69, 86,
      -127, 2, 18, 0, 0, 0,
    ]);
  });
});

describe("gzip解凍", () => {
  it("gzip圧縮したテストデータをBlobにしてgzip解凍すると、元のテストデータになる", () => {
    const utilities = new NodeUtilities();
    const compressedData = new InMemoryBlob([
      31, -117, 8, 0, 0, 0, 0, 0, 0, -1, 123, -36, -36, -10, -72, 105, -25, -29,
      -26, -114, -57, -51, -19, -113, -101, -9, 60, 110, -38, 15, 0, 69, 86,
      -127, 2, 18, 0, 0, 0,
    ]);
    const decompressedData = utilities.ungzip(compressedData);
    expect(decompressedData.getDataAsString()).toEqual("テストデータ");
  });
});

describe("blobの生成", () => {
  it("テストデータをBlobにして、任意の配列になる", () => {
    const utilities = new NodeUtilities();
    const data = utilities.newBlob("テストデータ");
    expect(data.getBytes()).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });
});

describe("zip圧縮 → 解凍", () => {
  it("zip圧縮したテストデータをBlobにしてzip解凍すると、元のテストデータになる", () => {
    const utilities = new NodeUtilities();
    const data = utilities.newBlob("テストデータ");
    const compressedData = utilities.zip([data]);
    const decompressedData = utilities.unzip(compressedData);
    expect(decompressedData[0].getDataAsString()).toEqual("テストデータ");
  });
});

describe("parseDate", () => {
  it("日付文字列をDateオブジェクトに変換できる", () => {
    const utilities = new NodeUtilities();
    const dateString = "2024-01-01T12:00:00Z";
    const date = utilities.parseDate(
      dateString,
      "UTC",
      "yyyy-MM-dd'T'HH:mm:ss'Z'",
    );
    expect(date.toISOString()).toEqual("2024-01-01T12:00:00.000Z");
  });

  it("フォーマットから復元したDateをそのままタイムゾーン変換に渡せる", () => {
    const utilities = new NodeUtilities();
    const dateString = "2024-01-01 12:34:56.789";
    const date = utilities.parseDate(
      dateString,
      "Asia/Tokyo",
      "yyyy-MM-dd HH:mm:ss.SSS",
    );

    expect(date.toISOString()).toEqual("2024-01-01T03:34:56.789Z");
  });
});

describe("CSVの解析", () => {
  it("CSV文字列を2次元配列に変換できる", () => {
    const utilities = new NodeUtilities();
    const csvString = "a,b,c\n1,2,3\n4,5,6";
    const result = utilities.parseCsv(csvString);
    expect(result).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ]);
  });

  it("タブ区切り文字列を2次元配列に変換できる", () => {
    const utilities = new NodeUtilities();
    const csvString = "a\tb\tc\n1\t2\t3\n4\t5\t6";
    const result = utilities.parseCsv(csvString, "\t");
    expect(result).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ]);
  });
});

describe("sleep", () => {
  it("100ミリ秒処理を停止する", () => {
    const utilities = new NodeUtilities();
    const start = Date.now();
    utilities.sleep(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });
});
