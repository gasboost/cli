import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NodeUrlFetchApp } from "./NodeUrlFetchApp";

let server: ReturnType<typeof spawn> | undefined;
let baseUrl: string;
let portFile: string;

beforeAll(async () => {
  portFile = path.join(
    os.tmpdir(),
    `gasboost-url-fetch-${process.pid}-${Date.now()}.port`,
  );

  server = spawn(
    process.execPath,
    [path.join(__dirname, "test-http-server.cjs"), portFile],
    {
      stdio: ["ignore", "ignore", "inherit"],
    },
  );

  const port = await new Promise<number>((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (fs.existsSync(portFile)) {
        const value = fs.readFileSync(portFile, "utf8").trim();
        const parsed = Number(value);

        if (Number.isInteger(parsed) && parsed > 0) {
          resolve(parsed);
          return;
        }

        reject(
          new Error(`Test HTTP server returned an invalid port: ${value}`),
        );
        return;
      }

      if (Date.now() - startedAt > 5_000) {
        reject(new Error("Timed out waiting for test HTTP server to start."));
        return;
      }

      setTimeout(check, 10);
    };

    check();
  });

  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (server) {
    server.kill("SIGTERM");

    const startedAt = Date.now();

    while (server.exitCode === null && server.signalCode === null) {
      if (Date.now() - startedAt > 5_000) {
        server.kill("SIGKILL");
        break;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
    }
  }

  if (portFile && fs.existsSync(portFile)) {
    fs.unlinkSync(portFile);
  }
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
