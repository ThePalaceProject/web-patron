import { NextRequest, NextResponse } from "next/server";
import { parseBoolean } from "utils/envParse";
import { LANGUAGE_SELECTOR_FEATURE_FLAG_ENV } from "constants/env";

/**
 * While the language selector feature flag is off, locale-prefixed URLs
 * (for example /es/...) redirect to the same path in the default locale, so
 * a bookmarked or hand-typed URL cannot reach a partially localized catalog.
 * Automatic locale detection is disabled separately (see instrumentation.ts),
 * so the redirect cannot bounce back to a non-default locale.
 */
export function proxy(request: NextRequest): NextResponse | undefined {
  if (parseBoolean(LANGUAGE_SELECTOR_FEATURE_FLAG_ENV, false)) {
    return undefined;
  }
  const { nextUrl } = request;
  if (
    nextUrl.locale !== "" &&
    nextUrl.defaultLocale !== undefined &&
    nextUrl.locale !== nextUrl.defaultLocale
  ) {
    const url = nextUrl.clone();
    url.locale = nextUrl.defaultLocale;
    return NextResponse.redirect(url, 307);
  }
  return undefined;
}

// Locale prefixes only occur on page routes; API routes and build assets are
// excluded so the proxy does not run for them. With i18n configured, Next.js
// prepends a locale segment and a literal "/" to non-root matchers, so the
// pattern cannot match a bare locale root; "/" is listed separately to cover
// locale roots like /es.
export const config = {
  matcher: ["/", "/((?!api/|_next/).*)"]
};
