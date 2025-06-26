import { AppAuthMethod } from "interfaces";
import * as React from "react";
import { screen, setup, fixtures } from "test-utils";
import Login from "../Login";
import { mockPush } from "test-utils/mockNextRouter";
import { unsupportedAuthMethod } from "test-utils/fixtures";

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

test("shows warning if only auth method provided is unsupported", async () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      libraryLinks: {
        helpEmail: { href: "mailto:help@gmail.com" }
      },
      // authMethod shouldn't be populated with unsupported method given type constraint
      // but we should ensure unsupported auth methods are removed
      authMethods: [unsupportedAuthMethod] as AppAuthMethod[]
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
const multipleAuthMethods: AppAuthMethod[] = [
  fixtures.basicTokenAuthMethod,
  fixtures.basicAuthMethod
];

test("shows loading indicator", () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      authMethods: multipleAuthMethods
    }
  });

  const loading = screen.getByText("Loading");
  expect(loading).toBeInTheDocument();
});

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

test("redirects to /[methodId] and uses first supported auth method when multiple methods are configured", () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      authMethods: multipleAuthMethods
    }
  });

  // first supported auth method is client-basic-token
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login/[methodId]",
      query: {
        methodId: "client-basic-token",
        nextUrl: "/testlib",
        library: "testlib"
      }
    },
    undefined,
    { shallow: true }
  );
});

test("filters out unsupported method and redirects to first supported auth method", () => {
  setup(<Login />, {
    library: {
      ...fixtures.libraryData,
      // authMethod shouldn't be populated with unsupported method given type constraint
      // but we should ensure unsupported auth methods are removed
      authMethods: [
        unsupportedAuthMethod,
        ...multipleAuthMethods
      ] as AppAuthMethod[]
    }
  });

  // first supported auth method is client-basic-token
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login/[methodId]",
      query: {
        methodId: "client-basic-token",
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
