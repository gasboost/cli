import { Buffer } from "node:buffer";
import fs from "node:fs";
import http from "node:http";
import process from "node:process";

const portFile = process.argv[2];

if (!portFile) {
  throw new Error("Port file path is required.");
}

const server = http.createServer((request, response) => {
  if (request.url === "/get" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "X-Test": "get",
    });

    response.end(
      JSON.stringify({
        method: request.method,
      }),
    );

    return;
  }

  if (request.url === "/post" && request.method === "POST") {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      response.writeHead(200, {
        "Content-Type": "application/json",
      });

      response.end(
        JSON.stringify({
          method: request.method,
          contentType: request.headers["content-type"],
          body: Buffer.concat(chunks).toString("utf-8"),
        }),
      );
    });

    return;
  }

  if (request.url === "/not-found") {
    response.writeHead(404, {
      "Content-Type": "text/plain",
    });

    response.end("not found");
    return;
  }

  if (request.url === "/error") {
    response.writeHead(500, {
      "Content-Type": "text/plain",
    });

    response.end("internal server error");
    return;
  }

  if (request.url === "/redirect") {
    response.writeHead(302, {
      Location: "/redirected",
    });

    response.end();
    return;
  }

  if (request.url === "/redirected") {
    response.writeHead(200, {
      "Content-Type": "text/plain",
    });

    response.end("redirected");
    return;
  }

  response.writeHead(404);
  response.end();
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();

  if (typeof address !== "object" || address === null) {
    process.exit(1);
  }

  const temporaryPortFile = `${portFile}.tmp`;

  fs.writeFileSync(temporaryPortFile, String(address.port), "utf8");

  fs.renameSync(temporaryPortFile, portFile);
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
