import { InMemoryCache } from "./InMemoryCache";

export class InMemoryCacheService
  implements GoogleAppsScript.Cache.CacheService
{
  constructor() {}
  getDocumentCache(): InMemoryCache | null {
    return new InMemoryCache();
  }
  getUserCache(): InMemoryCache {
    return new InMemoryCache();
  }
  getScriptCache(): InMemoryCache {
    return new InMemoryCache();
  }
}
