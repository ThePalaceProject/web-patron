import { AuthCredentials, OPDS1 } from "interfaces";
import Cookie from "js-cookie";
import { generateCredentials } from "utils/auth";
import { basicTokenAuthenticationUrl } from "./fixtures";

const mockCookie = Cookie as any;

export const creds: AuthCredentials = {
  token: "some-token",
  methodType: OPDS1.BasicAuthType
};

export const persistentUserCredentials = generateCredentials("1234", "pinpin");
export const firstToken = "IaMaBeArErToKeN";
export const tokenCreds1: AuthCredentials = {
  token: {
    basicToken: persistentUserCredentials,
    bearerToken: firstToken
  },
  authenticationUrl: basicTokenAuthenticationUrl,
  methodType: OPDS1.BasicTokenAuthType
};

export const newToken = "IaMaBeArErToKeN2";
export const tokenCreds2: AuthCredentials = {
  token: {
    basicToken: persistentUserCredentials,
    bearerToken: newToken
  },
  authenticationUrl: basicTokenAuthenticationUrl,
  methodType: OPDS1.BasicTokenAuthType
};

const str = JSON.stringify;

export default function mockAuthenticatedOnce(
  credentials: AuthCredentials | null = creds
) {
  mockCookie.get.mockReturnValueOnce(str(credentials));
}

export function mockAuthenticated(credentials: AuthCredentials | null = creds) {
  mockCookie.get.mockReturnValue(str(credentials));
}
