import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";

const SignUpLink: React.FC = () => {
  const {
    libraryLinks: { registration }
  } = useLibraryContext();

  if (!registration?.href) return null;

  return (
    <div sx={{ textAlign: "center" }}>
      <ExternalLink href={registration.href}>
        Sign up for a library card
      </ExternalLink>
    </div>
  );
};

export default SignUpLink;
