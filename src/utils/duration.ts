import { DurationFormat } from "@formatjs/intl-durationformat";
import { Language } from "utils/i18n";

/**
 * Formats a duration given in seconds for display in the given locale.
 *
 * Uses the @formatjs polyfill rather than the native Intl.DurationFormat:
 * the app's pinned Node 22 does not have the global, and TypeScript does not
 * type it. Output is identical to the native implementation.
 *
 * Sub-minute remainders round up, so a 59-second title reads "1 minute"
 * rather than disappearing.
 */
export function formatDuration(
  seconds: number,
  locale: Language
): string | undefined {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;

  const totalMinutes = Math.ceil(seconds / 60);
  const formatter = new DurationFormat(locale, { style: "long" });
  // zero-valued units are omitted, so a whole-hour duration formats as
  // "2 hours" rather than "2 hours, 0 minutes"
  return formatter.format({
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  });
}
