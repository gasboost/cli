import { describe, expect, it } from "vitest";
import { InMemoryContext } from "./InMemoryContext";
import { InMemorySession } from "./InMemorySession";
import { OAuthScope, SecurityPolicy } from "./SecurityPolicy";

describe("アクティブユーザーの取得", () => {
  it("スクリプトオーナーのメールアドレスが不正な場合、エラーになる", () => {
    expect(() => {
      const context = new InMemoryContext(
        "invalid-email",
        "example@example.com",
        { type: "WEB_APP", executeAs: "OWNER" },
        new SecurityPolicy([]),
        "ja",
        "Asia/Tokyo",
      );
      new InMemorySession(context);
    }).toThrowError("Invalid email: invalid-email");
  });

  it("実行ユーザーのメールアドレスが不正な場合、エラーになる", () => {
    expect(() => {
      const context = new InMemoryContext(
        "example@example.com",
        "invalid-email",
        { type: "WEB_APP", executeAs: "OWNER" },
        new SecurityPolicy([]),
        "ja",
        "Asia/Tokyo",
      );
      new InMemorySession(context);
    }).toThrowError("Invalid email: invalid-email");
  });

  describe("セキュリティポリシーでユーザーIDへのアクセスが", () => {
    it("許可されていない場合、emailは空文字になる", () => {
      const context = new InMemoryContext(
        "example@example.com",
        "example@example.com",
        { type: "WEB_APP", executeAs: "OWNER" },
        new SecurityPolicy([]),
        "ja",
        "Asia/Tokyo",
      );
      const session = new InMemorySession(context);
      const activeUser = session.getActiveUser();
      expect(activeUser.getEmail()).toBe("");
    });
    describe("許可されていて", () => {
      describe("シンプルトリガーで", () => {
        it("開発者が実行した場合、emailは実行者のメールアドレスになる", () => {
          const context = new InMemoryContext(
            "developer@example.com",
            "developer@example.com",
            {
              type: "TRIGGER",
              triggerType: "SIMPLE",
              triggerOwner: "developer@example.com",
            },
            new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
            "ja",
            "Asia/Tokyo",
          );
          const session = new InMemorySession(context);
          const activeUser = session.getActiveUser();
          expect(activeUser.getEmail()).toBe("developer@example.com");
        });

        describe("非開発者で", () => {
          it("ドメインが同じユーザーが実行した場合、emailは実行者のメールアドレスになる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@example.com",
              {
                type: "TRIGGER",
                triggerType: "SIMPLE",
                triggerOwner: "developer@example.com",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("user@example.com");
          });

          it("ドメインが違うユーザーが実行した場合、emailは空文字になる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@test.com",
              {
                type: "TRIGGER",
                triggerType: "SIMPLE",
                triggerOwner: "developer@example.com",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("");
          });
        });
      });

      describe("Googleスプレッドシートのカスタム関数で", () => {
        it("開発者が実行した場合、実行者のメールアドレスを返す", () => {
          const context = new InMemoryContext(
            "developer@example.com",
            "developer@example.com",
            {
              type: "CUSTOM_FUNCTION",
            },
            new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
            "ja",
            "Asia/Tokyo",
          );
          const session = new InMemorySession(context);
          const activeUser = session.getActiveUser();
          expect(activeUser.getEmail()).toBe("developer@example.com");
        });

        describe("非開発者で", () => {
          it("ドメインが同じユーザーが実行した場合、emailは実行者のメールアドレスになる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@example.com",
              {
                type: "CUSTOM_FUNCTION",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("user@example.com");
          });

          it("ドメインが違うユーザーが実行した場合、emailは空文字になる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@test.com",
              {
                type: "CUSTOM_FUNCTION",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("");
          });
        });
      });

      describe("自分（開発者）として実行に設定されたウェブアプリで", () => {
        it("開発者が実行した場合、実行者のメールアドレスを返す", () => {
          const context = new InMemoryContext(
            "developer@example.com",
            "developer@example.com",
            {
              type: "WEB_APP",
              executeAs: "OWNER",
            },
            new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
            "ja",
            "Asia/Tokyo",
          );
          const session = new InMemorySession(context);
          const activeUser = session.getActiveUser();
          expect(activeUser.getEmail()).toBe("developer@example.com");
        });
        describe("非開発者で", () => {
          it("ドメインが同じユーザーが実行した場合、emailは実行者のメールアドレスになる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@example.com",
              {
                type: "WEB_APP",
                executeAs: "OWNER",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("user@example.com");
          });

          it("ドメインが違うユーザーが実行した場合、emailは空文字になる", () => {
            const context = new InMemoryContext(
              "developer@example.com",
              "user@test.com",
              {
                type: "WEB_APP",
                executeAs: "OWNER",
              },
              new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
              "ja",
              "Asia/Tokyo",
            );
            const session = new InMemorySession(context);
            const activeUser = session.getActiveUser();
            expect(activeUser.getEmail()).toBe("");
          });
        });
      });
    });
  });
});

describe("エフェクティブユーザーの取得", () => {
  it("スクリプトが [自分（デベロッパー）として実行] に設定されているウェブアプリの場合、デベロッパーのユーザー アカウントを返す", () => {
    const context = new InMemoryContext(
      "developer@example.com",
      "user@example.com",
      {
        type: "WEB_APP",
        executeAs: "OWNER",
      },
      new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
      "ja",
      "Asia/Tokyo",
    );
    const session = new InMemorySession(context);
    const effectiveUser = session.getEffectiveUser();
    expect(effectiveUser.getEmail()).toBe("developer@example.com");
  });

  it("スクリプトがインストール可能なトリガーで実行されている場合、トリガーを作成したユーザーのアカウントが返されます", () => {
    const context = new InMemoryContext(
      "developer@example.com",
      "user@example.com",
      {
        type: "TRIGGER",
        triggerType: "INSTALLABLE",
        triggerOwner: "user2@example.com",
      },
      new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
      "ja",
      "Asia/Tokyo",
    );
    const session = new InMemorySession(context);
    const effectiveUser = session.getEffectiveUser();
    expect(effectiveUser.getEmail()).toBe("user2@example.com");
  });

  it("それ以外の場合はgetActiveUser()と同じユーザー アカウントが返されます", () => {
    const context = new InMemoryContext(
      "developer@example.com",
      "user@example.com",
      {
        type: "WEB_APP",
        executeAs: "USER",
      },
      new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
      "ja",
      "Asia/Tokyo",
    );
    const session = new InMemorySession(context);
    const effectiveUser = session.getEffectiveUser();
    const activeUser = session.getActiveUser();
    expect(effectiveUser.getEmail()).toBe(activeUser.getEmail());
  });
});

describe("スクリプトのタイムゾーンの取得", () => {
  it("スクリプトのタイムゾーンを返す", () => {
    const context = new InMemoryContext(
      "developer@example.com",
      "user@example.com",
      {
        type: "WEB_APP",
        executeAs: "USER",
      },
      new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
      "ja",
      "Asia/Tokyo",
    );
    const session = new InMemorySession(context);
    expect(session.getScriptTimeZone()).toBe("Asia/Tokyo");
  });
});

describe("ユーザーのロケールの取得", () => {
  it("ユーザーのロケールを返す", () => {
    const context = new InMemoryContext(
      "developer@example.com",
      "user@example.com",
      {
        type: "WEB_APP",
        executeAs: "USER",
      },
      new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
      "ja",
      "Asia/Tokyo",
    );
    const session = new InMemorySession(context);
    expect(session.getActiveUserLocale()).toBe("ja");
  });
});
