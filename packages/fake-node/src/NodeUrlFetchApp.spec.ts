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
      followRedirects: true,
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
      followRedirects: true,
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
      followRedirects: true,
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

  it("contentTypeをContent-Typeヘッダーとして送信する", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {},
      body: Buffer.from("ok"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    urlFetchApp.fetch("https://example.com", {
      method: "post",
      contentType: "application/json",
      payload: '{"message":"hello"}',
    });

    expect(request).toHaveBeenCalledWith("POST", "https://example.com", {
      headers: {
        "Content-Type": "application/json",
      },
      body: '{"message":"hello"}',
      followRedirects: true,
    });
  });

  it("Content-Typeヘッダーが明示されている場合はcontentTypeで上書きしない", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {},
      body: Buffer.from("ok"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    urlFetchApp.fetch("https://example.com", {
      method: "post",
      contentType: "application/json",
      headers: {
        "content-type": "application/custom",
      },
      payload: "data",
    });

    expect(request).toHaveBeenCalledWith("POST", "https://example.com", {
      headers: {
        "content-type": "application/custom",
      },
      body: "data",
      followRedirects: true,
    });
  });

  it("followRedirectsをsync-requestに渡す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 302,
      headers: {
        location: "/redirected",
      },
      body: Buffer.from(""),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    urlFetchApp.fetch("https://example.com", {
      followRedirects: false,
      muteHttpExceptions: true,
    });

    expect(request).toHaveBeenCalledWith("GET", "https://example.com", {
      headers: {},
      body: undefined,
      followRedirects: false,
    });
  });

  it("followRedirectsを省略するとtrueを渡す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 200,
      headers: {},
      body: Buffer.from("ok"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    urlFetchApp.fetch("https://example.com");

    expect(request).toHaveBeenCalledWith("GET", "https://example.com", {
      headers: {},
      body: undefined,
      followRedirects: true,
    });
  });

  it("400以上のレスポンスはデフォルトで例外になる", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 404,
      headers: {},
      body: Buffer.from("not found"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    expect(() => urlFetchApp.fetch("https://example.com/missing")).toThrow(
      "Request failed for https://example.com/missing returned code 404.",
    );
  });

  it("muteHttpExceptionsがtrueなら400以上でもHTTPResponseを返す", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 404,
      headers: {},
      body: Buffer.from("not found"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch("https://example.com/missing", {
      muteHttpExceptions: true,
    });

    expect(response.getResponseCode()).toBe(404);
    expect(response.getContentText()).toBe("not found");
  });

  it("500以上のレスポンスもデフォルトで例外になる", () => {
    vi.mocked(request).mockReturnValue({
      statusCode: 500,
      headers: {},
      body: Buffer.from("internal server error"),
    } as ReturnType<typeof request>);

    const urlFetchApp = new NodeUrlFetchApp();

    expect(() => urlFetchApp.fetch("https://example.com/error")).toThrow(
      "Request failed for https://example.com/error returned code 500.",
    );
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
        followRedirects: true,
      },
    );

    expect(request).toHaveBeenNthCalledWith(
      2,
      "POST",
      "https://example.com/second",
      {
        headers: {},
        body: "data",
        followRedirects: true,
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
