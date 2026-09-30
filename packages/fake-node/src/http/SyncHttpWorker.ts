import { Buffer } from "node:buffer";
import { type MessagePort, workerData } from "node:worker_threads";
import type { SyncHttpRequestInput, SyncHttpResponse } from "./SyncHttpRequest";

interface WorkerInput {
  stateBuffer: SharedArrayBuffer;
  port: MessagePort;
  request: SyncHttpRequestInput;
}

interface WorkerSuccessMessage {
  ok: true;
  response: SyncHttpResponse;
}

interface WorkerErrorMessage {
  ok: false;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

const { stateBuffer, port, request } = workerData as WorkerInput;

const state = new Int32Array(stateBuffer);

async function execute(): Promise<void> {
  try {
    let body: string | Buffer | undefined;

    if (typeof request.body === "string") {
      body = request.body;
    } else if (request.body !== undefined) {
      body = Buffer.from(request.body);
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body,
      redirect: request.followRedirects ? "follow" : "manual",
    });

    const headers: Record<string, string | string[]> = {};

    for (const [name, value] of response.headers) {
      headers[name] = value;
    }

    const responseBody = new Uint8Array(await response.arrayBuffer());

    const message: WorkerSuccessMessage = {
      ok: true,
      response: {
        statusCode: response.status,
        headers,
        body: responseBody,
      },
    };

    port.postMessage(message);
  } catch (error) {
    const normalized =
      error instanceof Error ? error : new Error(String(error));

    const message: WorkerErrorMessage = {
      ok: false,
      error: {
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
      },
    };

    port.postMessage(message);
  } finally {
    Atomics.store(state, 0, 1);
    Atomics.notify(state, 0);

    port.close();
  }
}

void execute();
