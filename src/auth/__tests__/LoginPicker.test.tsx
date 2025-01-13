import { AppAuthMethod } from "interfaces";
import * as React from "react";
import { screen, setup, fixtures } from "test-utils";
import LoginPicker from "../LoginPicker";
import { mockPush } from "test-utils/mockNextRouter";

test("shows warning if there is no auth method configured", async () => {
  setup(<LoginPicker />, {
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

test("redirects to /[methodId] when only one method configured", () => {
  setup(<LoginPicker />, {
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
  setup(<LoginPicker />, {
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

const fourAuthMethods: AppAuthMethod[] = [
  fixtures.basicAuthMethod,
  fixtures.cleverAuthMethod,
  fixtures.createSamlMethod(0),
  fixtures.createSamlMethod(1)
];
test("shows buttons with four auth methods configured", async () => {
  setup(<LoginPicker />, {
    library: {
      ...fixtures.libraryData,
      authMethods: fourAuthMethods
    }
  });

  expect(
    screen.getByLabelText("Available authentication methods")
  ).toBeInTheDocument();
  const basicAuthButton = screen.getByRole("link", {
    name: "Login with Library Barcode"
  });
  expect(basicAuthButton).toBeInTheDocument();
  expect(basicAuthButton).toHaveAttribute(
    "href",
    "/testlib/login/client-basic?nextUrl=%2Ftestlib"
  );
  expect(
    screen.getByRole("link", { name: "Login with Clever" })
  ).toHaveAttribute("href", "/testlib/login/client-clever?nextUrl=%2Ftestlib");
  expect(
    screen.getByRole("link", { name: "Login with SAML IdP 0" })
  ).toHaveAttribute("href", "/testlib/login/id-0?nextUrl=%2Ftestlib");
  expect(
    screen.getByRole("link", { name: "Login with SAML IdP 1" })
  ).toHaveAttribute("href", "/testlib/login/id-1?nextUrl=%2Ftestlib");
});

test("shows combobox with five auth methods configured", async () => {
  const { user } = setup(<LoginPicker />, {
    library: {
      ...fixtures.libraryData,
      authMethods: [...fourAuthMethods, fixtures.createSamlMethod(2)]
    }
  });

  // should be no button
  expect(
    screen.queryByRole("button", { name: "Login with SAML IdP 0" })
  ).not.toBeInTheDocument();

  // should show combobox
  const select = screen.getByRole("combobox", { name: "Choose login method" });
  expect(select).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Clever" }));
  expect(screen.getByRole("option", { name: "SAML IdP 0" }));
  expect(screen.getByRole("option", { name: "SAML IdP 1" }));
  expect(screen.getByRole("option", { name: "SAML IdP 2" }));
  expect(screen.getByRole("option", { name: "Library Barcode" }));

  // selecting one should show a NavButton to that page
  await user.selectOptions(select, "client-basic");
  const barcodeLink = screen.getByRole("link", {
    name: "Login with Library Barcode"
  });
  expect(barcodeLink).toHaveAttribute(
    "href",
    "/testlib/login/client-basic?nextUrl=%2Ftestlib"
  );

  // select another
  await user.selectOptions(select, "id-1");
  expect(
    screen.queryByText("Login with Library Barcode")
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Login with SAML IdP 1" })
  ).toBeInTheDocument();
});
