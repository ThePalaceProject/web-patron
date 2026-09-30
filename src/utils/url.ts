import { REDIRECT_LOGIN_QUERY_PARAM } from "utils/constants";

/** Query params the Circulation Manager appends to the redirect after SAML or OIDC sign-in. */
const SIGN_IN_QUERY_PARAMS = [REDIRECT_LOGIN_QUERY_PARAM, "patron_info"];

/**
 * Appends a query parameter to an absolute URL, preserving any existing
 * query string and encoding the value.
 */
export function appendSearchParam(
  href: string,
  name: string,
  value: string
): string {
  const url = new URL(href);
  url.searchParams.set(name, value);
  return url.toString();
}

export function searchParams(href: string): URLSearchParams | null {
  try {
    return new URL(href).searchParams;
  } catch {
    return null;
  }
}

/**
 * Removes the credentials and patron details that sign-in callbacks leave in
 * the address, so the URL is safe to send to a third party.
 * Clever returns its token in the hash, so the hash is dropped entirely.
 */
export function stripCredentials(href: string): string {
  const url = new URL(href);
  SIGN_IN_QUERY_PARAMS.forEach(param => url.searchParams.delete(param));
  url.hash = "";
  return url.toString();
}
