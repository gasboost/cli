import { InMemoryHttpResponse } from "@gasboost/fake-core";
import request, { type HttpVerb } from "sync-request";

export class NodeUrlFetchApp implements GoogleAppsScript.URL_Fetch.UrlFetchApp {
  fetch(url: string): GoogleAppsScript.URL_Fetch.HTTPResponse;
  fetch(
    url: string,
    params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse;
  fetch(
    url: string,
    params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {},
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    const method = (params.method ?? "get").toUpperCase() as HttpVerb;

    const headers: Record<string, string> = {
      ...(params.headers ?? {}),
    };

    let body: string | Buffer | undefined;

    if (typeof params.payload === "string") {
      body = params.payload;
    } else if (Array.isArray(params.payload)) {
      body = Buffer.from(params.payload.map((byte: number) => byte & 0xff));
    } else if (
      params.payload !== undefined &&
      typeof params.payload === "object" &&
      "getBytes" in params.payload
    ) {
      const blob = params.payload as GoogleAppsScript.Base.Blob;

      body = Buffer.from(blob.getBytes().map((byte: number) => byte & 0xff));
    }

    const response = request(method, url, {
      headers,
      body,
    });

    const responseHeaders: Record<string, string | string[]> = {};

    for (const [name, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        responseHeaders[name] = value;
      }
    }

    return new InMemoryHttpResponse(
      response.body,
      response.statusCode,
      responseHeaders,
    );
  }

  fetchAll(
    requests: Array<GoogleAppsScript.URL_Fetch.URLFetchRequest | string>,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse[] {
    return requests.map((requestData) => {
      if (typeof requestData === "string") {
        return this.fetch(requestData);
      }

      const { url, ...params } = requestData;

      return this.fetch(url, params);
    });
  }

  getRequest(url: string): GoogleAppsScript.URL_Fetch.URLFetchRequest;
  getRequest(
    url: string,
    params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
  ): GoogleAppsScript.URL_Fetch.URLFetchRequest;
  getRequest(
    url: string,
    params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {},
  ): GoogleAppsScript.URL_Fetch.URLFetchRequest {
    return {
      url,
      ...params,
    };
  }
}
