import { Language } from "utils/i18n";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Formats a date string for display in the given locale.
 *
 * By default timeZone is set to UTC so a publication date does not shift
 * by a day depending on the patron's time zone.
 * Pass `utc: false` for a time zone aware timestamp, which can be used to provide
 * an active loan's end date relative to a patron's time zone. When timeZone is undefined,
 * Intl.DateTimeFormat relies on the host environment's time zone as defined in the ECMAScript
 * Internationalization specs: https://tc39.es/ecma402/#sec-intl.datetimeformat.prototype.resolvedoptions
 *
 * Returns undefined for an unparseable date. Intl.DateTimeFormat.format
 * throws a RangeError on an Invalid Date, and a malformed date on one feed
 * entry should hide one field rather than fail the render.
 */
export function formatDate(
  inputDate: string,
  locale: Language,
  { utc = true }: { utc?: boolean } = {}
): string | undefined {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) return undefined;

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: utc ? "UTC" : undefined
  });
  return formatter.format(date);
}

export type TimeLeft =
  | { unit: "days" | "hours"; count: number }
  | { unit: "lessThanHour" };

/**
 * The time left until a date, for showing how long a loan has left.
 * Rounds down, mirroring ios-core and android-core.
 */
export function timeUntil(
  inputDate: string,
  now: number = Date.now()
): TimeLeft | undefined {
  const remaining = new Date(inputDate).getTime() - now;
  if (Number.isNaN(remaining) || remaining <= 0) return undefined;

  const hours = Math.floor(remaining / HOUR_MS);
  if (hours >= 24) return { unit: "days", count: Math.floor(hours / 24) };
  if (hours >= 1) return { unit: "hours", count: hours };
  return { unit: "lessThanHour" };
}
