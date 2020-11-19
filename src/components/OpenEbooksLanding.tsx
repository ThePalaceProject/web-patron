/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H2, Text } from "./Text";
import Button from "./Button";
import Stack from "./Stack";
import CleverButton from "auth/CleverAuthButton";
import { OPDS1 } from "interfaces";
import useLibraryContext from "./context/LibraryContext";
import { BasicAuthMethod, CleverAuthMethod } from "types/opds1";
import useUser from "./context/UserContext";
import SignOut from "./SignOut";
import useAuthModalContext from "auth/AuthModalContext";
import SvgChevronRight from "icons/ExpandMore";
import BasicAuthButton from "auth/BasicAuthButton";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import Page from "components/Page";
import Footer from "components/Footer";
import GlobalStyles from "components/GlobalStyles";
import { ErrorBoundary } from "components/ErrorBoundary";
import { APP_CONFIG } from "utils/env";

type PopularBook = { alt: string; imgHref: string };

const popularBooks = {
  EarlyGrades: [
    { alt: "book cover text 1", imgHref: "/img/earlygrades-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/earlygrades-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/earlygrades-3.jpg" }
  ],
  MiddleGrades: [
    { alt: "book cover text 1", imgHref: "/img/middlegrades-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/middlegrades-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/middlegrades-3.jpg" }
  ],
  HighSchool: [
    { alt: "book cover text 1", imgHref: "/img/highschool-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/highschool-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/highschool-3.jpg" }
  ]
};

const LandingPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <ErrorBoundary>
        <GlobalStyles />
        <OpenEbooksLandingComponent />
        <Footer />
      </ErrorBoundary>
    </Page>
  );
};

const OpenEbooksLandingComponent = () => {
  const { authMethods } = useLibraryContext();
  const cleverMethod: CleverAuthMethod = authMethods.find(
    method => method.type === OPDS1.CleverAuthType
  ) as CleverAuthMethod;
  const basicMethod: BasicAuthMethod = authMethods.find(
    method => method.type === OPDS1.BasicAuthType
  ) as BasicAuthMethod;

  return (
    <>
      <div
        sx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <OpenEbooksHero />
        <div
          sx={{
            flex: "2",
            maxWidth: 1100,
            mx: "auto",
            my: 4,
            textAlign: "center"
          }}
        >
          <div
            sx={{
              mx: [2, 4]
            }}
          >
            <H2>Lorem Ipsum Secondary Headline Welcome Openebooks</H2>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Text>
          </div>
        </div>
        <div
          id="loginRegion"
          sx={{
            backgroundColor: "ui.gray.extraLight"
          }}
        >
          <Stack
            direction="row"
            sx={{
              maxWidth: 1100,
              mx: "auto",
              display: "flex",
              textAlign: ["center", "center", "left"],
              flexWrap: ["wrap", "wrap", "nowrap"]
            }}
          >
            <Stack
              direction="column"
              sx={{
                mx: [3, 5],
                my: 4,
                justifyContent: "space-between",
                flexWrap: ["wrap", "nowrap"]
              }}
            >
              <div>
                <img alt="Clever Logo" src={"/img/CleverLogo.png"} />
              </div>
              <Text>
                Clever is the platform that powers technology in the classroom.
                Today, one in three innovative K-12 schools in the U.S. trust
                Clever to secure their student data as they adopt learning apps
                in the classroom.
              </Text>
              <div>
                <CleverButton sx={{ margin: 0 }} method={cleverMethod} />
              </div>
            </Stack>
            <Stack
              direction="column"
              sx={{
                mx: [3, 5],
                my: 4,
                justifyContent: "space-between",
                flexWrap: ["wrap", "nowrap"]
              }}
            >
              <div>
                <img alt="FirstBook Logo" src={"/img/FirstBookLogo.png"} />
              </div>
              <Text>
                First Book is a nonprofit organization that provides access to
                high quality, brand new books and educational resources - for
                free and at low cost - to schools and programs serving children
                in need.
              </Text>
              <div>
                <BasicAuthButton
                  method={basicMethod}
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onClick={() => {}}
                ></BasicAuthButton>
              </div>
            </Stack>
          </Stack>
        </div>
        <div
          sx={{
            backgroundColor: "brand.primary"
          }}
        >
          <div
            sx={{
              maxWidth: 1100,
              textAlign: ["center", "center", "left"],
              mx: "auto",
              display: "flex",
              flexWrap: "wrap",
              flexDirection: ["column", "column", "row"]
            }}
          >
            <div
              sx={{
                flex: "1",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <img
                sx={{ alignItems: "flex-end" }}
                alt="Mobile Device with Open Ebooks"
                src={"/img/SimplyEIpad.png"}
              />
            </div>
            <Stack
              direction="column"
              sx={{
                flex: "2",
                my: 4,
                mx: [2, 4],
                color: "ui.white"
              }}
            >
              <H2>Open e-Books Mobile Shoutout Here</H2>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </Text>
            </Stack>
          </div>
        </div>
        <div sx={{ maxWidth: 1100, mx: "auto" }}>
          <PopularBookSection books={popularBooks.HighSchool} />
          <PopularBookSection
            books={popularBooks.MiddleGrades}
            coverLocation="right"
          />
          <PopularBookSection books={popularBooks.EarlyGrades} />
        </div>
        <div sx={{ backgroundColor: "brand.primary" }}>
          <div
            sx={{
              maxWidth: 1100,
              mx: "auto",
              textAlign: "center",
              color: "ui.white"
            }}
          >
            <Stack direction="column" sx={{ mx: [3, 5], my: 4 }}>
              <H2>FAQ</H2>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.{" "}
              </Text>
              <div>
                <Button variant="filled" color="ui.white">
                  <span sx={{ color: "ui.black" }}> Learn More</span>
                </Button>
              </div>
            </Stack>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Components in the Landing Page
 */

const OpenEbooksHero: React.FC = () => {
  const { isAuthenticated, isLoading } = useUser();
  const { showModalAndReset } = useAuthModalContext();

  return (
    <div
      sx={{
        backgroundImage: `url('/img/HeroImage.jpg')`,
        minHeight: "350px",

        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        sx={{
          minHeight: "350px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div sx={{ display: "flex", margin: 3, justifyContent: "flex-end" }}>
          {isAuthenticated ? (
            <SignOut />
          ) : (
            <Button
              variant="white"
              onClick={showModalAndReset}
              loading={isLoading}
            >
              Log In
            </Button>
          )}
        </div>
        <div
          sx={{
            margin: "auto",
            maxWidth: "1100"
          }}
        >
          <img
            sx={{
              mx: "auto"
            }}
            alt="Open Ebooks Logo"
            src="/img/OpenEbooksLogo.png"
          />
        </div>
        {/* The down arrow that goes to the login section */}
        <div sx={{ display: "flex", alignItems: "center" }}>
          <a
            href="#loginRegion"
            sx={{
              backgroundColor: "ui.white",
              margin: "auto",
              textAlign: "center",
              borderRadius: "25px 25px 0 0",
              display: "flex",
              paddingTop: "5px"
            }}
          >
            <SvgChevronRight sx={{ width: "50px", height: "25px" }} />
          </a>
        </div>
      </div>
    </div>
  );
};

const PopularBookSection: React.FC<{
  books: PopularBook[];
  coverLocation?: "left" | "right";
}> = ({ books, coverLocation }) => {
  return (
    <div
      sx={{
        display: "flex",
        my: [0, 0, 4],
        mx: [2, 4],
        flexDirection: [
          "column",
          "column",
          coverLocation === "right" ? "row" : "row-reverse"
        ]
      }}
    >
      <Stack
        direction="column"
        sx={{
          minWidth: "300px",
          flex: "1",
          mx: [0, 2],
          marginTop: [4, 4, 0]
        }}
      >
        <H2>Popular Early Grades Books</H2>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
      </Stack>
      {/* The three book covers */}
      <div
        sx={{
          height: "100%",
          display: "flex",
          flex: "2",
          justifyContent: "space-between"
        }}
      >
        {books.map(book => {
          return (
            <div
              key={book.imgHref}
              sx={{
                flex: "[1, 0, 1]",
                mx: [0, 2],
                my: [2, 2, 0],
                paddingLeft: 1,
                backgroundColor: "brand.secondary",
                width: "30%",
                height: "100%"
              }}
            >
              <img
                sx={{ maxWidth: "100%", minWidth: ["100px", "100px"] }}
                alt={book.alt}
                src={book.imgHref}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage;

export const landingPageStaticProps: GetStaticProps = withAppProps(
  undefined,
  APP_CONFIG.openebooks?.defaultLibrary
);
export const landingPageStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ["/"],
    fallback: false
  };
};
