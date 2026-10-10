import { InMemoryProperties } from "./InMemoryProperties";

export type InMemoryPropertiesServiceOptions = {
  document?: Record<string, string>;
  user?: Record<string, string>;
  script?: Record<string, string>;
};

export class InMemoryPropertiesService
  implements GoogleAppsScript.Properties.PropertiesService
{
  private readonly documentProperties = new InMemoryProperties();
  private readonly userProperties = new InMemoryProperties();
  private readonly scriptProperties = new InMemoryProperties();

  constructor(options: InMemoryPropertiesServiceOptions = {}) {
    this.documentProperties.setProperties(options.document ?? {});
    this.userProperties.setProperties(options.user ?? {});
    this.scriptProperties.setProperties(options.script ?? {});
  }

  getDocumentProperties(): GoogleAppsScript.Properties.Properties {
    return this.documentProperties;
  }

  getUserProperties(): GoogleAppsScript.Properties.Properties {
    return this.userProperties;
  }

  getScriptProperties(): GoogleAppsScript.Properties.Properties {
    return this.scriptProperties;
  }
}
