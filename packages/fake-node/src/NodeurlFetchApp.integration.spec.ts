import { spawn } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NodeUrlFetchApp } from "./NodeUrlFetchApp";

let server: ReturnType<typeof spawn> | undefined;
let baseUrl: string;

beforeAll(async () => {
  server = spawn(
    process.execPath,
    [path.join(__dirname, "test-http-server.mjs")],
    {
      stdio: ["ignore", "pipe", "inherit"],
    },
  );

  const port = await new Promise<number>((resolve, reject) => {
    const stdout = server?.stdout;

    if (!server || !stdout) {
      reject(new Error("Failed to start test HTTP server."));
      return;
    }

    stdout.setEncoding("utf8");

    const onData = (data: string | Buffer) => {
      const value = data.toString().trim();

      const parsed = Number(value);

      cleanup();

      if (Number.isInteger(parsed) && parsed > 0) {
        resolve(parsed);
        return;
      }

      reject(new Error(`Test HTTP server returned an invalid port: ${value}`));
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onExit = (code: number | null) => {
      cleanup();

      reject(
        new Error(
          `Test HTTP server exited before startup with code ${String(code)}.`,
        ),
      );
    };

    const cleanup = () => {
      stdout.off("data", onData);

      server?.off("error", onError);

      server?.off("exit", onExit);
    };

    stdout.once("data", onData);

    server.once("error", onError);

    server.once("exit", onExit);
  });

  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (!server || server.exitCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      server?.kill("SIGKILL");
    }, 1_000);

    timeout.unref();

    server?.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    server?.kill("SIGTERM");
  });

  server.stdout?.destroy();
  server.stderr?.destroy();
  server.stdin?.destroy();

  server.unref();
});

describe("NodeUrlFetchApp integration", () => {
  it("GETリクエストを実際に送信できる", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch(`${baseUrl}/get`);

    expect(response.getResponseCode()).toBe(200);

    expect(JSON.parse(response.getContentText())).toEqual({
      method: "GET",
    });

    expect(response.getHeaders()).toMatchObject({
      "x-test": "get",
    });
  });

  it("POSTでcontentTypeとpayloadを実際に送信できる", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch(`${baseUrl}/post`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        message: "hello",
      }),
    });

    expect(response.getResponseCode()).toBe(200);

    expect(JSON.parse(response.getContentText())).toEqual({
      method: "POST",
      contentType: "application/json",
      body: '{"message":"hello"}',
    });
  });

  it("404レスポンスはデフォルトで例外になる", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    expect(() => urlFetchApp.fetch(`${baseUrl}/not-found`)).toThrow(
      `Request failed for ${baseUrl}/not-found returned code 404.`,
    );
  });

  it("muteHttpExceptionsがtrueなら404レスポンスを取得できる", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch(`${baseUrl}/not-found`, {
      muteHttpExceptions: true,
    });

    expect(response.getResponseCode()).toBe(404);

    expect(response.getContentText()).toBe("not found");
  });

  it("redirectをデフォルトで追跡する", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch(`${baseUrl}/redirect`);

    expect(response.getResponseCode()).toBe(200);

    expect(response.getContentText()).toBe("redirected");
  });

  it("followRedirectsがfalseならredirectを追跡しない", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    const response = urlFetchApp.fetch(`${baseUrl}/redirect`, {
      followRedirects: false,
      muteHttpExceptions: true,
    });

    expect(response.getResponseCode()).toBe(302);

    expect(response.getHeaders()).toMatchObject({
      location: "/redirected",
    });
  });

  it("通信できない場合は例外になる", () => {
    const urlFetchApp = new NodeUrlFetchApp();

    expect(() => urlFetchApp.fetch("http://127.0.0.1:1")).toThrow();
  });
});
