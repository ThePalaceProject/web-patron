import * as React from "react";

type LibraryCardListProps = React.HTMLAttributes<HTMLUListElement>;

/** A vertical list of library cards. Each child should be an <li>. */
const LibraryCardList: React.FC<LibraryCardListProps> = ({
  children,
  ...rest
}) => (
  // eslint-disable-next-line jsx-a11y/no-redundant-roles
  <ul
    {...rest}
    // Keeps list semantics in Safari, which drops them from lists styled
    // with listStyle: none.
    role="list"
    sx={{
      listStyle: "none",
      pl: 0,
      maxWidth: "40rem",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }}
  >
    {children}
  </ul>
);

export default LibraryCardList;
