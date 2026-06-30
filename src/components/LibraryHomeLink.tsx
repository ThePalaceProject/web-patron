/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import Link from "next/link";

export interface LibraryHomeLinkProps {
  slug: string;
  title?: string;
}

/**
 * A link to a library's home page from the multi-library selection page.
 * Displays the library's title, if available. Otherwise, falls back to its slug.
 */
const LibraryHomeLink: React.FC<
  React.PropsWithChildren<LibraryHomeLinkProps>
> = ({ slug, title, children }) => {
  return <Link href={`/${slug}`}>{children ?? (title || slug)}</Link>;
};

export default LibraryHomeLink;
