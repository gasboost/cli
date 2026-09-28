import { InMemoryUser } from "./InMemoryUser";
import { OAuthScope, SecurityPolicy } from "./SecurityPolicy";

type Execution =
  | {
      type: "WEB_APP";
      executeAs: "OWNER" | "USER";
    }
  | {
      type: "TRIGGER";
      triggerType: "SIMPLE" | "INSTALLABLE";
      triggerOwner: string;
    }
  | {
      type: "CUSTOM_FUNCTION";
    };

export class InMemoryContext {
  public readonly owner: InMemoryUser;
  public readonly activeUser: InMemoryUser;
  public readonly triggerdBy: InMemoryUser | undefined;

  constructor(
    ownerEmail: string,
    activeUserEmail: string,
    public readonly execution: Execution,
    public readonly securityPolicy: SecurityPolicy,
    public readonly locale: string,
    public readonly timezone: string,
  ) {
    this.owner = new InMemoryUser(ownerEmail);
    this.activeUser = new InMemoryUser(activeUserEmail);
    this.triggerdBy =
      execution.type === "TRIGGER"
        ? new InMemoryUser(execution.triggerOwner)
        : undefined;
  }

  canAccessUserEmail(): boolean {
    // OAuth未承認
    if (!this.securityPolicy.hasPermission(OAuthScope.USERINFO_EMAIL)) {
      return false;
    }
    return true;
  }

  isRestricted() {
    if (this.execution.type === "TRIGGER") {
      return this.execution.triggerType === "SIMPLE";
    }
    if (this.execution.type === "CUSTOM_FUNCTION") {
      return true;
    }
    if (this.execution.type === "WEB_APP") {
      return this.execution.executeAs === "OWNER";
    }
    return false;
  }

  isExecutingAsOwner(): boolean {
    return this.activeUser.getEmail() === this.owner.getEmail();
  }

  isSameDomain(): boolean {
    return this.owner.getDomain() === this.activeUser.getDomain();
  }

  isWebAppExecutingAsOwner(): boolean {
    return (
      this.execution.type === "WEB_APP" && this.execution.executeAs === "OWNER"
    );
  }

  isInstallableTrigger(): boolean {
    return (
      this.execution.type === "TRIGGER" &&
      this.execution.triggerType === "INSTALLABLE"
    );
  }

  getTriggerSetupUserEmail(): string {
    if (this.execution.type === "TRIGGER") {
      return this.execution.triggerOwner;
    }
    return "";
  }
}
