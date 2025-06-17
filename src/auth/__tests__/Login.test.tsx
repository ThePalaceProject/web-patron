import { AppAuthMethod } from "interfaces";
import * as React from "react";
import { screen, setup, fixtures } from "test-utils";
import Login from "../Login";
import { mockPush } from "test-utils/mockNextRouter";

test("shows warning if there is no auth method configured", async () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      libraryLinks: {
        helpEmail: { href: "mailto:help@gmail.com" }
      },
      authMethods: []
    }
  });
  expect(
    screen.getByText(
      "This Library does not have any authentication configured."
    )
  );
  expect(screen.getByLabelText("Send email to help desk")).toHaveAttribute(
    "href",
    "mailto:help@gmail.com"
  );
});

const oneAuthMethod: AppAuthMethod[] = [fixtures.basicAuthMethod];

test("redirects to /[methodId] when one method configured", () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      authMethods: oneAuthMethod
    }
  });

  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login/[methodId]",
      query: {
        methodId: "client-basic",
        nextUrl: "/testlib",
        library: "testlib"
      }
    },
    undefined,
    { shallow: true }
  );
});

test("preserves nextUrl query param on redirection", () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      authMethods: oneAuthMethod
    },
    router: {
      query: {
        // we want to be sure it preserves this query param
        nextUrl: "somewhere"
      }
    }
  });

  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login/[methodId]",
      query: {
        methodId: "client-basic",
        library: "testlib",
        nextUrl: "somewhere"
      }
    },
    undefined,
    { shallow: true }
  );
});
