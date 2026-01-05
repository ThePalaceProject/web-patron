import * as React from "react";
import Head from "next/head";
import Button from "components/Button";
import Link from "components/Link";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import useUser from "components/context/UserContext";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";

/**
 * This page is shown after SAML/Clever sign-out to warn users about
 * IdP session persistence on shared/public computers.
 *
 * Note: This page intentionally does not include the header/layout
 * to avoid showing the "Sign In" button.
 */
const SignedOutContent: React.FC = () => {
  const { isAuthenticated } = useUser();
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();

  // If user somehow gets to this page while signed in, redirect them to the
  // library's home page. They shouldn't be here, if signed in.
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(buildMultiLibraryLink("/"));
    }
  }, [isAuthenticated, router, buildMultiLibraryLink]);

  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: [3, 5],
        py: 4
      }}
    >
      <Head>
        <title>Signed Out</title>
      </Head>

      <div
        sx={{
          maxWidth: 600,
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1 sx={{ mb: 4, fontSize: [4, 5] }}>Signed Out</h1>

        <div
          sx={{
            backgroundColor: "ui.error.light",
            border: "2px solid",
            borderColor: "ui.error",
            borderRadius: 2,
            p: 4,
            mb: 4
          }}
        >
          <h2 sx={{ mt: 0, color: "ui.error" }}>Important Security Notice</h2>
          <p sx={{ fontSize: 3, textAlign: "left" }}>
            You have been signed out of this application, but your session with
            the authentication provider may still be active.
          </p>
          <p sx={{ fontSize: 3, textAlign: "left" }}>
            This could lead to you (or someone else) being signed back into your
            account without needing to provided your credentials; or it could
            prevent you from signing into a different account.
          </p>
          <p sx={{ fontSize: 3, fontWeight: "bold", textAlign: "left", mb: 0 }}>
            If you are using a shared or public computer (or need to sign into a
            different account), please exit / quit your browser completely to
            ensure that you are fully signed out.
          </p>
        </div>

        <Link href="/">
          <Button aria-label="Return to Catalog">Return to Catalog</Button>
        </Link>
      </div>
    </div>
  );
};

const SignedOutPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <SignedOutContent />
    </Page>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default SignedOutPage;
