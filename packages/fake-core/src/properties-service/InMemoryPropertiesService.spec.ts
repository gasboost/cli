import { describe, expect, it } from "vitest";
import { InMemoryPropertiesService } from "./InMemoryPropertiesService";

describe("InMemoryPropertiesService", () => {
  it("各スコープで同一インスタンスを返し、値を保持する", () => {
    const service = new InMemoryPropertiesService();
    const document = service.getDocumentProperties();
    const user = service.getUserProperties();
    const script = service.getScriptProperties();

    expect(service.getDocumentProperties()).toBe(document);
    expect(service.getUserProperties()).toBe(user);
    expect(service.getScriptProperties()).toBe(script);

    document.setProperty("key", "document");
    user.setProperties({ key: "user" });
    script.setProperty("key", "script");

    expect(document.getProperty("key")).toBe("document");
    expect(user.getProperty("key")).toBe("user");
    expect(script.getProperty("key")).toBe("script");
  });

  it("constructorから各スコープの初期値を設定できる", () => {
    const service = new InMemoryPropertiesService({
      document: { DOCUMENT_KEY: "document" },
      user: { USER_KEY: "user" },
      script: { AUTH_PEPPER: "ci-pepper" },
    });
    const document = service.getDocumentProperties();
    const user = service.getUserProperties();
    const script = service.getScriptProperties();

    expect(document.getProperty("DOCUMENT_KEY")).toBe("document");
    expect(user.getProperty("USER_KEY")).toBe("user");
    expect(script.getProperty("AUTH_PEPPER")).toBe("ci-pepper");
  });
});
