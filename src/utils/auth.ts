import {
  AuthProvider,
  AuthMethod,
  BasicAuthMethod
} from "opds-web-client/lib/interfaces";

/**
 * This is used to find the basic auth provider in <Auth />,
 * out of a potential array of auth providers.
 */
export const BASIC_AUTH_ID = "http://opds-spec.org/auth/basic";

/**
 * This is a typescript type guard used to narrow the type of the
 * passed in provider.
 */
function providerIsBasicAuth(
  provider: AuthProvider<AuthMethod | BasicAuthMethod>
): provider is AuthProvider<BasicAuthMethod> {
  const correctId = provider.id === BASIC_AUTH_ID;
  // const hasLabels = !!(provider.method as BasicAuthMethod).labels;
  const hasLabels = "labels" in provider.method;
  return correctId && hasLabels;
}

export function getBasicAuthProvider(
  providers: AuthProvider<AuthMethod>[] | null
): AuthProvider<BasicAuthMethod> | null {
  if (!providers) return null;
  for (const provider of providers) {
    if (providerIsBasicAuth(provider)) {
      return provider;
    }
  }
  return null;
}
