/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

/*
 * Long enough to wait out an auto-repeating Tab key, yet short enough to
 * do prefetch before a patron presses Enter after settling on a library.
 */
export const FOCUS_PREFETCH_DEBOUNCE_MS = 300;

export interface LibraryHomeLinkProps {
  slug: string;
  title?: string;
}

/**
 * A link to a library's home page from the multi-library selection page.
 * Displays the library's title, if available. Otherwise, falls back to its slug.
 *
 * prefetch={false} turns off next/link's prefetch of every link in the viewport,
 * which would otherwise fetch many libraries at once. next/link prefetches on
 * hover and on touch, but not on focus, so the handlers below extend the same
 * treatment to keyboard navigation. They wait out FOCUS_PREFETCH_DEBOUNCE_MS to
 * reduce prefetches for libraries the patron is tabbing past.
 *
 * Notes:
 * - Next.js skips prefetching outside a production build, so neither path
 * does anything when running in dev mode.
 * - Importing Link from next/link rather than components/Link because the
 * latter prepends the current library's slug, which it reads from a
 * LibraryContext that the multi-library home page does not have handy.
 */
const LibraryHomeLink: React.FC<
  React.PropsWithChildren<LibraryHomeLinkProps>
> = ({ slug, title, children }) => {
  const router = useRouter();
  const href = `/${slug}`;
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const cancelPrefetch = () => clearTimeout(timer.current);
  React.useEffect(() => cancelPrefetch, []);

  const prefetchOnFocus = () => {
    cancelPrefetch();
    timer.current = setTimeout(
      /* Ignore a failed prefetch. The page still loads when the link is clicked. */
      () => void router.prefetch(href).catch(() => null),
      FOCUS_PREFETCH_DEBOUNCE_MS
    );
  };

  return (
    <Link
      href={href}
      prefetch={false}
      onFocus={prefetchOnFocus}
      onBlur={cancelPrefetch}
    >
      {children ?? (title || slug)}
    </Link>
  );
};

export default LibraryHomeLink;
