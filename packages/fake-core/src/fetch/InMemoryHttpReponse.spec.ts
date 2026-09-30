import { describe, expect, it } from "vitest";
import { InMemoryHttpResponse } from "./InMemoryHttpResponse";

describe("レスポンスコード", () => {
  it("指定したレスポンスコードを取得できる", () => {
    const response = new InMemoryHttpResponse("OK", 201);

    expect(response.getResponseCode()).toBe(201);
  });

  it("レスポンスコードを省略すると200になる", () => {
    const response = new InMemoryHttpResponse("OK");

    expect(response.getResponseCode()).toBe(200);
  });
});

describe("コンテンツ", () => {
  it("文字列のコンテンツを取得できる", () => {
    const response = new InMemoryHttpResponse("テストデータ");

    expect(response.getContentText()).toBe("テストデータ");
  });

  it("バイト配列のコンテンツをApps Script形式の符号付きバイト配列で取得できる", () => {
    const response = new InMemoryHttpResponse(
      Uint8Array.from([0, 127, 128, 255]),
    );

    expect(response.getContent()).toEqual([0, 127, -128, -1]);
  });

  it("文字列をApps Script形式の符号付きバイト配列で取得できる", () => {
    const response = new InMemoryHttpResponse("テストデータ");

    expect(response.getContent()).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });

  it("charsetを指定して文字列を初期化できる", () => {
    const response = new InMemoryHttpResponse("test", 200, {}, "UTF_8");

    expect(response.getContentText()).toBe("test");
  });
});

describe("ヘッダー", () => {
  it("単一値のヘッダーを取得できる", () => {
    const response = new InMemoryHttpResponse("OK", 200, {
      "Content-Type": "text/plain",
      "X-Test": "value",
    });

    expect(response.getHeaders()).toEqual({
      "Content-Type": "text/plain",
      "X-Test": "value",
    });
  });

  it("複数値のヘッダーはgetHeadersでは最初の値を返す", () => {
    const response = new InMemoryHttpResponse("OK", 200, {
      "Set-Cookie": ["first=value", "second=value"],
    });

    expect(response.getHeaders()).toEqual({
      "Set-Cookie": "first=value",
    });
  });

  it("getAllHeadersでは複数値のヘッダーを配列で取得できる", () => {
    const response = new InMemoryHttpResponse("OK", 200, {
      "Content-Type": "text/plain",
      "Set-Cookie": ["first=value", "second=value"],
    });

    expect(response.getAllHeaders()).toEqual({
      "Content-Type": "text/plain",
      "Set-Cookie": ["first=value", "second=value"],
    });
  });

  it("初期化に渡したヘッダー配列を後から変更してもレスポンスには影響しない", () => {
    const cookies = ["first=value", "second=value"];

    const response = new InMemoryHttpResponse("OK", 200, {
      "Set-Cookie": cookies,
    });

    cookies.push("third=value");

    expect(response.getAllHeaders()).toEqual({
      "Set-Cookie": ["first=value", "second=value"],
    });
  });

  it("getAllHeadersで取得したヘッダー配列を変更しても内部状態には影響しない", () => {
    const response = new InMemoryHttpResponse("OK", 200, {
      "Set-Cookie": ["first=value", "second=value"],
    });

    const headers = response.getAllHeaders() as Record<
      string,
      string | string[]
    >;

    const cookies = headers["Set-Cookie"];

    if (Array.isArray(cookies)) {
      cookies.push("third=value");
    }

    expect(response.getAllHeaders()).toEqual({
      "Set-Cookie": ["first=value", "second=value"],
    });
  });
});

describe("Blob", () => {
  it("レスポンスボディをBlobとして取得できる", () => {
    const response = new InMemoryHttpResponse("テストデータ");

    const blob = response.getBlob();

    expect(blob.getDataAsString()).toBe("テストデータ");
  });

  it("Content-TypeヘッダーをBlobのcontentTypeとして使用する", () => {
    const response = new InMemoryHttpResponse("テストデータ", 200, {
      "Content-Type": "text/plain",
    });

    const blob = response.getBlob();

    expect(blob.getContentType()).toBe("text/plain");
  });

  it("Content-Typeヘッダー名は大文字小文字を区別しない", () => {
    const response = new InMemoryHttpResponse("テストデータ", 200, {
      "content-type": "application/json",
    });

    const blob = response.getBlob();

    expect(blob.getContentType()).toBe("application/json");
  });

  it("Content-Typeがない場合はBlobのcontentTypeがnullになる", () => {
    const response = new InMemoryHttpResponse("テストデータ");

    const blob = response.getBlob();

    expect(blob.getContentType()).toBeNull();
  });

  it("getAsで指定したContent-TypeのBlobを取得できる", () => {
    const response = new InMemoryHttpResponse("テストデータ", 200, {
      "Content-Type": "text/plain",
    });

    const blob = response.getAs("application/json");

    expect(blob.getContentType()).toBe("application/json");
    expect(blob.getDataAsString()).toBe("テストデータ");
  });
});
