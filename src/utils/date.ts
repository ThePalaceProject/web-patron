import { Language } from "utils/i18n";

/**
 * Formats a date string for display in the given locale.
 *
 * timeZone is pinned to UTC so a publication date does not shift by a day
 * depending on the reader's timezone.
 *
 * Returns undefined for an unparseable date. Intl.DateTimeFormat.format
 * throws a RangeError on an Invalid Date, and a malformed date on one feed
 * entry should hide one field rather than fail the render.
 */
export function formatDate(
  inputDate: string,
  locale: Language
): string | undefined {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) return undefined;

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC"
  });
  return formatter.format(date);
}
