import { describe, expect, it } from "vitest";
import { InMemoryProperties } from "./InMemoryProperties";

describe("InMemoryProperties", () => {
  it("キーと値を保存して取得できる", () => {
    const properties = new InMemoryProperties();

    expect(properties.setProperty("key", "value")).toBe(properties);
    expect(properties.getProperty("key")).toBe("value");
    expect(properties.getProperties()).toEqual({ key: "value" });
    expect(properties.getKeys()).toEqual(["key"]);
  });

  it("存在しないキーはnullを返す", () => {
    const properties = new InMemoryProperties();

    expect(properties.getProperty("missing")).toBeNull();
  });

  it("複数のプロパティをまとめて保存できる", () => {
    const properties = new InMemoryProperties();

    expect(properties.setProperties({ key1: "value1", key2: "value2" })).toBe(
      properties,
    );

    expect(properties.getProperties()).toEqual({
      key1: "value1",
      key2: "value2",
    });
    expect(properties.getKeys()).toEqual(["key1", "key2"]);
  });

  it("deleteAllがtrueのときは既存の値を消してから保存する", () => {
    const properties = new InMemoryProperties();

    properties.setProperty("oldKey", "oldValue");
    properties.setProperties({ key: "value" }, true);

    expect(properties.getProperties()).toEqual({ key: "value" });
    expect(properties.getProperty("oldKey")).toBeNull();
  });

  it("キーを削除できる", () => {
    const properties = new InMemoryProperties();

    properties.setProperty("key", "value");

    expect(properties.deleteProperty("key")).toBe(properties);
    expect(properties.getProperty("key")).toBeNull();
    expect(properties.getKeys()).toEqual([]);
  });

  it("すべてのプロパティを削除できる", () => {
    const properties = new InMemoryProperties();

    properties.setProperties({ key1: "value1", key2: "value2" });

    expect(properties.deleteAllProperties()).toBe(properties);
    expect(properties.getProperties()).toEqual({});
    expect(properties.getKeys()).toEqual([]);
  });
});
