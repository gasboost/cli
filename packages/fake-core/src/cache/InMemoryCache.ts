interface CacheValue {
  value: string;
  expirationTime: number;
}

export class InMemoryCache implements GoogleAppsScript.Cache.Cache {
  private storage: Map<string, CacheValue> = new Map();
  constructor(private date: { now: () => number } = Date) {}
  put(key: string, value: string, expirationInSeconds: number = 600): void {
    if (key.length > 250) {
      throw new Error("Argument too large: key");
    }
    const valueSize = new TextEncoder().encode(value).length;

    if (valueSize > 100 * 1024) {
      throw new Error("Argument too large: value");
    }

    if (expirationInSeconds < 1 || expirationInSeconds > 21600) {
      throw new Error("Argument out of range: expirationInSeconds");
    }

    const expirationTime = this.date.now() + expirationInSeconds * 1000;

    // キャッシュのアイテム数が1000を超える場合、新しいアイテムを追加する前に、期限が近い100個が削除され、900個だけ残る
    if (this.storage.size >= 1000) {
      const entries = Array.from(this.storage.entries());
      entries.sort((a, b) => a[1].expirationTime - b[1].expirationTime);
      const nearlyExpirationTimeKeys = entries
        .slice(0, 101)
        .map(([key]) => key);
      for (const expiringKey of nearlyExpirationTimeKeys) {
        this.storage.delete(expiringKey);
      }
    }
    this.storage.set(key, { value, expirationTime });
  }

  putAll(
    values: Record<string, string>,
    expirationInSeconds: number = 600,
  ): void {
    for (const [key, value] of Object.entries(values)) {
      this.put(key, value, expirationInSeconds);
    }
  }

  get(key: string): string | null {
    const cacheValue = this.storage.get(key);
    if (!cacheValue) {
      return null;
    }
    const now = this.date.now();
    if (cacheValue.expirationTime < now) {
      this.storage.delete(key);
      return null;
    }
    return cacheValue.value;
  }

  getAll(keys: string[]): Record<string, string> {
    const values: Record<string, string> = {};

    for (const key of keys) {
      const value = this.get(key);

      if (value !== null) {
        values[key] = value;
      }
    }

    return values;
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  removeAll(keys: string[]): void {
    for (const key of keys) {
      this.remove(key);
    }
  }
}
