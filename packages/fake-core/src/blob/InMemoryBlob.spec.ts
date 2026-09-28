import { describe, expect, it } from "vitest";
import { InMemoryBlob } from "./InMemoryBlob";

describe("初期化", () => {
  it("テストデータをBlobにする、InMemoryBlobが作成される", () => {
    const data = new InMemoryBlob("テストデータ");
    expect(data.getBytes()).toEqual([
      -29, -125, -122, -29, -126, -71, -29, -125, -120, -29, -125, -121, -29,
      -125, -68, -29, -126, -65,
    ]);
  });
});

describe("文字列をBlobにする", () => {
  it("空のInMemoryBlobに文字列を文字コード指定せずにセットすると、UTF-8として正しく取得できる", () => {
    const data = new InMemoryBlob("");
    data.setDataFromString("テストデータ");

    expect(data.getDataAsString()).toBe("テストデータ");
  });
});
