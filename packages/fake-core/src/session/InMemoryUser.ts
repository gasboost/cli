export class InMemoryUser implements GoogleAppsScript.Base.User {
  constructor(private readonly email: string) {
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!regex.test(email) && email !== "") {
      throw new Error(`Invalid email: ${email}`);
    }
  }
  getEmail(): string {
    return this.email;
  }
  getDomain(): string {
    return this.email.split("@")[1] || "";
  }
  getUserLoginId(): string {
    return this.email.split("@")[0] || "";
  }
}
