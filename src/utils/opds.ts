import { StdUriTemplate } from "@std-uritemplate/std-uritemplate";
import { OPDS2 } from "interfaces";

/**
 * Well-known term URIs for URI template variables. Callers use these constants
 * as keys in the TermValueMap they pass to normalizeLink, decoupling the
 * variable name used in the template from the semantic meaning of its value.
 */
export const UriTemplateTerms = {
  REDIRECT_URI: "http://palaceproject.io/terms/redirect-uri"
} as const;

/**
 * A link that may contain a URI template in its href. Structurally compatible
 * with OPDS1.OidcLink and any other link type that carries template metadata.
 */
export interface TemplatedLink {
  href: string;
  templated?: boolean;
  properties?: OPDS2.UriTemplateProperties;
}

/**
 * Maps term URIs to concrete values. Build this from UriTemplateTerms constants
 * and the values you want to inject.
 *
 * Example: { [UriTemplateTerms.REDIRECT_URI]: "https://app.example.com/callback" }
 */
export type TermValueMap = Partial<Record<string, string>>;

/**
 * Maps variable names to fallback values. Used when the link carries no
 * uri_template_variables map, or when a variable name has no entry in that map.
 *
 * Example: { post_logout_redirect_uri: "https://app.example.com/signed-out" }
 */
export type VariableFallbackMap = Partial<Record<string, string>>;

export type NormalizeLinkOptions = {
  termValues?: TermValueMap;
  fallbacks?: VariableFallbackMap;
};

/**
 * Normalizes a link by resolving any URI template in its href.
 *
 * For non-templated links, returns the link unchanged.
 *
 * For templated links, returns a new link with the href expanded (via full
 * RFC 6570) and the `templated` property removed. Template variables are
 * resolved in order:
 *   1. The variable's term URI (from properties.uri_template_variables.map)
 *      is used to look up a value in termValues.
 *   2. If that lookup fails, fallbacks[variableName] is used instead.
 *   3. If no value is found and the variable is required (required is true or
 *      absent), an error is thrown. If required is false, the variable is
 *      omitted per RFC 6570 expansion rules.
 */
export function normalizeLink<T extends TemplatedLink>(
  link: T,
  { termValues = {}, fallbacks = {} }: NormalizeLinkOptions = {}
): Omit<T, "templated"> {
  if (!link.templated) return link as unknown as Omit<T, "templated">;

  const varMap = link.properties?.uri_template_variables?.map ?? {};
  const substitutions: Record<string, string | undefined> = {};

  for (const varName of extractTemplateVarNames(link.href)) {
    const varDef = varMap[varName];
    const valueFromTerms =
      varDef !== undefined ? termValues[varDef.term] : undefined;
    const value = valueFromTerms ?? fallbacks[varName];

    if (value === undefined) {
      if (varDef?.required !== false) {
        throw new Error(
          `Required URI template variable "${varName}" has no value`
        );
      }
    } else {
      substitutions[varName] = value;
    }
  }

  const { templated: _, ...rest } = link;
  return {
    ...rest,
    href: StdUriTemplate.expand(link.href, substitutions)
  } as Omit<T, "templated">;
}

/** Extracts all variable names from a URI template string. */
function extractTemplateVarNames(template: string): string[] {
  const names: string[] = [];
  for (const match of template.matchAll(/\{[^}]+\}/g)) {
    // Strip the operator character (if any) and split comma-separated names.
    const inner = match[0].slice(1, -1).replace(/^[+#./;?&=,!@|]/, "");
    names.push(...inner.split(",").map(s => s.trim().replace(/\*$/, "")));
  }
  return names;
}
