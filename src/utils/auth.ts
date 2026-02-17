import {
  OPDS1,
  AppAuthMethod,
  ClientSamlMethod,
  ClientOidcMethod
} from "interfaces";

/**
 * Normalizes authentication methods from the OPDS authentication document
 * into a flat array of client-ready auth methods with unique IDs.
 *
 * Handles special cases:
 * - SAML methods with multiple IdP links are expanded into separate methods
 * - OIDC methods use only the first link
 * - All methods get a unique ID (either their href or type)
 */
export function normalizeAuthMethods(
  authDoc: OPDS1.AuthDocument
): AppAuthMethod[] {
  return authDoc.authentication.reduce<AppAuthMethod[]>((flattened, method) => {
    if (isServerSamlMethod(method)) {
      return [...flattened, ...serverToClientSamlMethods(method)];
    }
    if (isServerOidcMethod(method)) {
      const oidcMethod = serverToClientOidcMethod(method);
      return oidcMethod ? [...flattened, oidcMethod] : flattened;
    }
    return [...flattened, { ...method, id: method.type }];
  }, []);
}

export const isServerSamlMethod = (
  method: OPDS1.ServerAuthMethod
): method is OPDS1.ServerSamlMethod =>
  method.type === OPDS1.SamlAuthType && "links" in method;

export const isServerOidcMethod = (
  method: OPDS1.ServerAuthMethod
): method is OPDS1.ServerOidcMethod =>
  method.type === OPDS1.OidcAuthType && "links" in method;

function serverToClientSamlMethods(
  samlMethod: OPDS1.ServerSamlMethod
): ClientSamlMethod[] {
  if (!samlMethod.links) return [];
  return samlMethod.links.map(idp => ({
    // use the href as the id for saml methods because there can be >1 saml method
    id: idp.href,
    href: idp.href,
    type: samlMethod.type,
    description: getEnglishValue(idp.display_names) ?? "Unknown SAML Provider"
  }));
}

/**
 * Converts a server-side OIDC method to a client-ready OIDC method.
 * Uses only the first link from the links array.
 *
 * @returns ClientOidcMethod if links exist, null otherwise
 */
function serverToClientOidcMethod(
  oidcMethod: OPDS1.ServerOidcMethod
): ClientOidcMethod | null {
  if (!oidcMethod.links || oidcMethod.links.length === 0) return null;
  const link = oidcMethod.links[0]; // First link only

  return {
    id: link.href, // Use href as unique ID
    href: link.href,
    type: oidcMethod.type,
    description:
      getEnglishValue(link.display_names) ??
      oidcMethod.description ??
      "OIDC Provider"
  };
}

export const getEnglishValue = (
  arr: Array<{ language: string; value: string }>
) => arr.find(item => item.language === "en")?.value;

export function generateCredentials(username: string, password = "") {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}
