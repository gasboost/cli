import fs from "node:fs";
import path from "node:path";
import {
  MessageChannel,
  receiveMessageOnPort,
  Worker,
} from "node:worker_threads";

export interface SyncHttpRequestInput {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string | Uint8Array;
  followRedirects: boolean;
}

export interface SyncHttpResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: Uint8Array;
}

interface SyncHttpSuccessMessage {
  ok: true;
  response: SyncHttpResponse;
}

interface SyncHttpErrorMessage {
  ok: false;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

type SyncHttpMessage = SyncHttpSuccessMessage | SyncHttpErrorMessage;

export function syncHttpRequest(
  request: SyncHttpRequestInput,
): SyncHttpResponse {
  const workerPath = path.resolve(
    __dirname,
    "../../dist/http/SyncHttpWorker.js",
  );

  if (!fs.existsSync(workerPath)) {
    throw new Error(`Sync HTTP worker was not built: ${workerPath}`);
  }

  const stateBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);

  const state = new Int32Array(stateBuffer);

  const { port1, port2 } = new MessageChannel();

  const worker = new Worker(workerPath, {
    workerData: {
      stateBuffer,
      port: port2,
      request,
    },
    transferList: [port2],
  });

  try {
    const waitResult = Atomics.wait(state, 0, 0, 10_000);

    if (waitResult === "timed-out") {
      throw new Error(
        `HTTP worker timed out: ${request.method} ${request.url}`,
      );
    }

    const received = receiveMessageOnPort(port1);

    if (!received) {
      throw new Error(
        `HTTP worker completed without returning a response: ${request.method} ${request.url}`,
      );
    }

    const message = received.message as SyncHttpMessage;

    if (!message.ok) {
      const error = new Error(message.error.message);

      error.name = message.error.name;

      if (message.error.stack) {
        error.stack = message.error.stack;
      }

      throw error;
    }

    return message.response;
  } finally {
    port1.close();

    void worker.terminate();
  }
}
