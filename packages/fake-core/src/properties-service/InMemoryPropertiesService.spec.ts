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

    expect(service.getDocumentProperties().getProperty("key")).toBe("document");
    expect(service.getUserProperties().getProperty("key")).toBe("user");
    expect(service.getScriptProperties().getProperty("key")).toBe("script");
  });

  it("constructorから各スコープの初期値を設定できる", () => {
    const service = new InMemoryPropertiesService({
      document: { DOCUMENT_KEY: "document" },
      user: { USER_KEY: "user" },
      script: { AUTH_PEPPER: "ci-pepper" },
    });

    expect(service.getDocumentProperties().getProperty("DOCUMENT_KEY")).toBe(\n      "document",\n    );
    expect(service.getUserProperties().getProperty("USER_KEY")).toBe("user");
    expect(service.getScriptProperties().getProperty("AUTH_PEPPER")).toBe(\n      "ci-pepper",\n    );
  });
});
