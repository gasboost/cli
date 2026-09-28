import { describe, expect, it } from "vitest";
import { InMemoryCache } from "./InMemoryCache";

describe("Key-Valueペアを保存する", () => {
  it("キーが250文字の場合は正常に保存できる", () => {
    const cache = new InMemoryCache();
    const key = "k".repeat(250);
    expect(() => cache.put(key, "value")).not.toThrow();
  });

  it("キーが250文字より長い場合、エラーになる", () => {
    const cache = new InMemoryCache();
    const longKey = "k".repeat(251);
    expect(() => cache.put(longKey, "value")).toThrowError(
      "Argument too large: key",
    );
  });

  it("Valueが100KB以下の場合は正常に保存できる", () => {
    const cache = new InMemoryCache();
    const value = "v".repeat(100 * 1024);
    expect(() => cache.put("key", value)).not.toThrow();
  });

  it("Valueが100KB超過の場合、エラーになる", () => {
    const cache = new InMemoryCache();
    const largeValue = "v".repeat(100 * 1024 + 1);
    expect(() => cache.put("key", largeValue)).toThrowError(
      "Argument too large: value",
    );
  });

  it("保存時間が1秒以上〜1時間(21,600秒)の範囲内に無い場合はエラーになる", () => {
    const cache = new InMemoryCache();
    expect(() => cache.put("key", "value", 1)).not.toThrow();
    expect(() => cache.put("key", "value", 21600)).not.toThrow();
    expect(() => cache.put("key", "value", 0)).toThrowError(
      "Argument out of range: expirationInSeconds",
    );
    expect(() => cache.put("key", "value", 21601)).toThrowError(
      "Argument out of range: expirationInSeconds",
    );
  });

  it("保存時間を指定しない場合は、600秒で保存される", () => {
    const cache = new InMemoryCache({ now: () => 0 });
    cache.put("key", "value");
    expect(cache["storage"].get("key")?.expirationTime).toBe(600 * 1000);
  });

  it("キャッシュに1000個を超過するアイテムを保存すると有効期限が遅い900個が優先的に残り、100個は消える", () => {
    const cache = new InMemoryCache();
    for (let i = 0; i < 1000; i++) {
      cache.put(`key${i}`, "value");
    }
    expect(() => cache.put("key1001", "value")).not.toThrowError();
    expect(cache["storage"].size).toBe(900);
  });
});

describe("Valueを取得する", () => {
  it("保存したValueを取得できる", () => {
    const cache = new InMemoryCache();
    cache.put("key", "value");

    const value = cache.get("key");
    expect(value).toBe("value");
  });

  it("保存した値が、期限を超過していた場合はnullを返す", () => {
    const cache = new InMemoryCache({ now: () => 0 });
    cache.put("key", "value", 1);

    cache["date"].now = () => 2000;

    const expiredValue = cache.get("key");
    expect(expiredValue).toBeNull();
  });

  it("保存していないKeyを取得しようとした場合はnullを返す", () => {
    const cache = new InMemoryCache();
    const value = cache.get("nonExistentKey");
    expect(value).toBeNull();
  });
});

describe("複数のKey-Valueペアを保存する", () => {
  it("複数のKey-Valueペアを保存できる", () => {
    const cache = new InMemoryCache();

    cache.putAll({
      key1: "value1",
      key2: "value2",
      key3: "value3",
    });

    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBe("value3");
  });
});

describe("複数のValueを取得する", () => {
  it("複数のKeyに対応するValueを取得できる", () => {
    const cache = new InMemoryCache();

    cache.put("key1", "value1");
    cache.put("key2", "value2");
    cache.put("key3", "value3");

    const values = cache.getAll(["key1", "key2", "key3"]);

    expect(values).toEqual({
      key1: "value1",
      key2: "value2",
      key3: "value3",
    });
  });

  it("存在しないKeyは結果に含まれない", () => {
    const cache = new InMemoryCache();

    cache.put("key1", "value1");

    const values = cache.getAll(["key1", "missing"]);

    expect(values).toEqual({
      key1: "value1",
    });
  });

  it("有効期限切れのValueは結果に含まれない", () => {
    const cache = new InMemoryCache({
      now: () => 0,
    });

    cache.put("key1", "value1", 1);
    cache.put("key2", "value2", 10);

    cache["date"].now = () => 2000;

    const values = cache.getAll(["key1", "key2"]);

    expect(values).toEqual({
      key2: "value2",
    });
  });

  it("空配列を指定した場合は空オブジェクトを返す", () => {
    const cache = new InMemoryCache();

    const values = cache.getAll([]);

    expect(values).toEqual({});
  });
});

describe("Key-Valueペアを削除する", () => {
  it("保存したKey-Valueペアを削除できる", () => {
    const cache = new InMemoryCache();

    cache.put("key", "value");

    cache.remove("key");

    expect(cache.get("key")).toBeNull();
  });

  it("存在しないKeyを削除してもエラーにならない", () => {
    const cache = new InMemoryCache();

    expect(() => {
      cache.remove("missing");
    }).not.toThrow();
  });

  it("削除後に同じKeyで再保存できる", () => {
    const cache = new InMemoryCache();

    cache.put("key", "value1");

    cache.remove("key");

    cache.put("key", "value2");

    expect(cache.get("key")).toBe("value2");
  });
});

describe("複数のKey-Valueペアを削除する", () => {
  it("複数のKey-Valueペアを削除できる", () => {
    const cache = new InMemoryCache();

    cache.put("key1", "value1");
    cache.put("key2", "value2");
    cache.put("key3", "value3");

    cache.removeAll(["key1", "key3"]);

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBeNull();
  });

  it("存在しないKeyが含まれていてもエラーにならない", () => {
    const cache = new InMemoryCache();

    cache.put("key1", "value1");

    expect(() => {
      cache.removeAll(["key1", "missing"]);
    }).not.toThrow();

    expect(cache.get("key1")).toBeNull();
  });

  it("空配列を指定した場合でもエラーにならない", () => {
    const cache = new InMemoryCache();

    expect(() => {
      cache.removeAll([]);
    }).not.toThrow();
  });
});
