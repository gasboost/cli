import { InMemoryBlob } from "@gasboost/fake-core";
import request from "sync-request";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NodeUrlFetchApp } from "./NodeUrlFetchApp";

vi.mock("sync-request", () => ({
  default: vi.fn(),
}));

describe("fetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("URLを指定するとGETリクエストを送信してHTTPResponseを返す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: Buffer.from('{"message":"ok"}'),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch("https://example.com");

    expect(request).toHaveBeenCalledWith("GET", "https://example.com", {
      headers: {},
      body: undefined,
    });

    expect(response.getResponseCode()).toBe(200);
    expect(response.getContentText()).toBe('{"message":"ok"}');
    expect(response.getAllHeaders()).toEqual({
      "content-type": "application/json",
    });
  });

  it("method、headers、文字列payloadをリクエストに渡す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 201,
      headers: {},
      body: Buffer.from("created"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch("https://example.com/users", {
      method: "post",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      payload: '{"name":"test"}',
    });

    expect(request).toHaveBeenCalledWith("POST", "https://example.com/users", {
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      body: '{"name":"test"}',
    });

    expect(response.getResponseCode()).toBe(201);
    expect(response.getContentText()).toBe("created");
  });

  it("BlobのpayloadをBufferとしてリクエストに渡す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {},
      body: Buffer.from("ok"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();
    const blob = new InMemoryBlob("テストデータ", "text/plain");

    urlFetchApp.fetch("https://example.com/upload", {
      method: "post",
      payload: blob,
    });

    expect(request).toHaveBeenCalledWith("POST", "https://example.com/upload", {
      headers: {},
      body: Buffer.from(blob.getBytes().map((byte: number) => byte & 0xff)),
    });
  });

  it("undefinedのレスポンスヘッダーは除外する", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {
        "content-type": "text/plain",
        "x-empty": undefined,
      },
      body: Buffer.from("ok"),
    } as unknown as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch("https://example.com");

    expect(response.getAllHeaders()).toEqual({
      "content-type": "text/plain",
    });
  });
});

describe("fetchAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("複数のリクエストを実行する", () => {
    vi.mocked(request)
      .mockReturnValueOnce({
        statusCode: 200,
        headers: {},
        body: Buffer.from("first"),
      } as ReturnType<typeof request>)
      .mockReturnValueOnce({
        statusCode: 201,
        headers: {},
        body: Buffer.from("second"),
      } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    const responses = urlFetchApp.fetchAll([
      "https://example.com/first",
      {
        url: "https://example.com/second",
        method: "post",
        payload: "data",
      },
    ]);

    expect(responses).toHaveLength(2);

    expect(responses[0].getResponseCode()).toBe(200);
    expect(responses[0].getContentText()).toBe("first");

    expect(responses[1].getResponseCode()).toBe(201);
    expect(responses[1].getContentText()).toBe("second");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "GET",
      "https://example.com/first",
      {
        headers: {},
        body: undefined,
      },
    );

    expect(request).toHaveBeenNthCalledWith(
      2,
      "POST",
      "https://example.com/second",
      {
        headers: {},
        body: "data",
      },
    );
  });
});

describe("getRequest", () => {
  it("URLとオプションからURLFetchRequestを生成する", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const requestData = urlFetchApp.getRequest("https://example.com", {
      method: "post",
      headers: {
        Authorization: "Bearer token",
      },
      payload: "data",
    });

    expect(requestData).toEqual({
      url: "https://example.com",
      method: "post",
      headers: {
        Authorization: "Bearer token",
      },
      payload: "data",
    });
  });
});
