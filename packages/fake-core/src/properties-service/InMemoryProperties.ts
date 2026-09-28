export class InMemoryProperties
  implements GoogleAppsScript.Properties.Properties
{
  private storage: Map<string, string> = new Map();

  deleteAllProperties(): GoogleAppsScript.Properties.Properties {
    this.storage.clear();
    return this;
  }

  deleteProperty(key: string): GoogleAppsScript.Properties.Properties {
    this.storage.delete(key);
    return this;
  }

  getKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  getProperties(): Record<string, string> {
    const result: Record<string, string> = {};
    this.storage.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  getProperty(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setProperties(
    properties: Record<string, string>,
    deleteAll?: boolean,
  ): GoogleAppsScript.Properties.Properties {
    if (deleteAll) {
      this.deleteAllProperties();
    }
    Object.entries(properties).forEach(([key, value]) => {
      this.storage.set(key, value);
    });
    return this;
  }

  setProperty(
    key: string,
    value: string,
  ): GoogleAppsScript.Properties.Properties {
    this.storage.set(key, value);
    return this;
  }
}
