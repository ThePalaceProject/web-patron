/**
 * Formats a duration given in seconds as a human-readable string.
 * Returns "${min} minutes" for durations <= 60 minutes,
 * otherwise "${hrs} hours, ${min} minutes".
 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.ceil(seconds / 60);
  if (totalMinutes <= 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hour${hours === 1 ? "" : "s"}, ${minutes} minute${minutes === 1 ? "" : "s"}`;
}
