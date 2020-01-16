/**
 * truncates a string at a given length.
 * if you select useWordBoundary, it will only
 * truncate at whole words
 */
const truncateString = (
  str: string,
  length: number,
  useWordBoundary = true
) => {
  if (str.length < length) return str;
  const substring = str.substring(0, length - 1);
  const finalTruncation = useWordBoundary
    ? substring.substring(0, substring.lastIndexOf(" "))
    : substring;

  return finalTruncation + "...";
};

export default truncateString;
