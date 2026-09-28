import { InMemoryContext } from "./InMemoryContext";
import { InMemoryUser } from "./InMemoryUser";

export enum Context {
  SIMPLE_TRIGGER = "SIMPLE_TRIGGER",
  CUSTOM_FUNCTION = "CUSTOM_FUNCTION",
  WEB_APP_SELF = "WEB_APP_SELF",
  OTHER = "OTHER",
}

export class InMemorySession implements GoogleAppsScript.Base.Session {
  constructor(private readonly context: InMemoryContext) {}

  getActiveUser(): InMemoryUser {
    // OAuth未承認
    if (!this.context.canAccessUserEmail()) {
      return new InMemoryUser("");
    }

    // 制限があるコンテキストか判定
    const isRestrictedContext = this.context.isRestricted();

    // 実行者がオーナーか判定
    const isOwnerExecuting = this.context.isExecutingAsOwner();

    // ドメインが同じか判定
    const isSameDomain = this.context.isSameDomain();

    // 制限があるコンテキストで、実行者がオーナーでない、かつドメインが同じでない場合は空文字を返す
    if (isRestrictedContext && !isOwnerExecuting && !isSameDomain) {
      return new InMemoryUser("");
    }

    return this.context.activeUser;
  }

  getActiveUserLocale(): string {
    return this.context.locale;
  }

  getEffectiveUser(): GoogleAppsScript.Base.User {
    const isWebAppExecuteAsOwner = this.context.isWebAppExecutingAsOwner();
    if (isWebAppExecuteAsOwner) {
      return this.context.owner;
    }

    const isInstallableTrigger = this.context.isInstallableTrigger();
    if (isInstallableTrigger) {
      return this.context.triggerdBy!;
    }
    return this.getActiveUser();
  }

  getScriptTimeZone(): string {
    return this.context.timezone;
  }

  getTemporaryActiveUserKey(): string {
    return "";
  }

  getTimeZone(): string {
    return this.context.timezone;
  }

  getUser(): GoogleAppsScript.Base.User {
    return new InMemoryUser("");
  }
}
