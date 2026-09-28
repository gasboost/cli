export enum OAuthScope {
  USERINFO_EMAIL = "https://www.googleapis.com/auth/userinfo.email",
}

export class SecurityPolicy {
  constructor(public readonly oauthScopes: OAuthScope[]) {}

  hasPermission(scope: OAuthScope): boolean {
    return this.oauthScopes.includes(scope);
  }
}
