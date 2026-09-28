import { InMemoryProperties } from "./InMemoryProperties";

export class InMemoryPropertiesService
  implements GoogleAppsScript.Properties.PropertiesService
{
  getDocumentProperties(): GoogleAppsScript.Properties.Properties {
    return new InMemoryProperties();
  }

  getUserProperties(): GoogleAppsScript.Properties.Properties {
    return new InMemoryProperties();
  }

  getScriptProperties(): GoogleAppsScript.Properties.Properties {
    return new InMemoryProperties();
  }
}
