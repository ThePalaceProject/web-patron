import { generateCredentials } from "../auth";

describe("generateCredentials", () => {
  test("returns basic auth credentials for the username and password", () => {
    const username = "foo";
    const password = "bar";
    const encoded = btoa(`${username}:${password}`);

    expect(generateCredentials(username, password)).toEqual(`Basic ${encoded}`);
  });

  test("treats undefined password as empty string", () => {
    const username = "foo";
    const encoded = btoa(`${username}:`);

    expect(generateCredentials(username)).toEqual(`Basic ${encoded}`);
  });
});
