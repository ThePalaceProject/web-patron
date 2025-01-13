import * as React from "react";
import { fixtures, screen, setup, waitFor } from "test-utils";
import BasicAuthHandler from "auth/BasicAuthHandler";
import { ClientBasicMethod, OPDS1 } from "interfaces";
import fetchMock from "jest-fetch-mock";
import Cookie from "js-cookie";
import { generateCredentials } from "utils/auth";
import { UserProvider } from "components/context/UserContext";
import { basicAuthMethod, cleverAuthMethod } from "test-utils/fixtures";
import { Keyboard } from "types/opds1";

const mockCookie = Cookie as any;

const method: ClientBasicMethod = {
  id: "basic-id",
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: OPDS1.BasicAuthType,
  description: "Library Barcode"
};

const noPasswordMethod: ClientBasicMethod = {
  ...method,
  inputs: {
    password: {
      keyboard: Keyboard.NoInput
    }
  }
};

beforeEach(() => fetchMock.resetMocks());

test("displays form", async () => {
  const { user } = setup(<BasicAuthHandler method={method} />);

  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  expect(barcode).toBeInTheDocument();
  expect(pin).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();

  await user.type(barcode, "1234");
  await user.type(pin, "pinpin");

  expect(barcode).toHaveValue("1234");
  expect(pin).toHaveValue("pinpin");
});

test("submits", async () => {
  // give the mock a delay to allow loading state to appear
  fetchMock.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(JSON.stringify(fixtures.loans)), 100)
      )
  );
  const { user } = setup(
    <UserProvider>
      <BasicAuthHandler method={method} />
    </UserProvider>
  );

  // act
  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  await user.type(barcode, "1234");
  await user.type(pin, "pinpin");
  const loginButton = screen.getByRole("button", { name: "Login" });
  await user.click(loginButton);

  const token = generateCredentials("1234", "pinpin");

  // shows a loading state
  const loadingButton = await screen.findByLabelText("Signing in...");
  expect(loadingButton).toBeInTheDocument();
  expect(loadingButton).toBeDisabled();

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    // we set the cookie
    expect(Cookie.set).toHaveBeenCalledTimes(1);
    expect(Cookie.set).toHaveBeenCalledWith(
      // the library slug is null because we are only running with one library
      "CPW_AUTH_COOKIE/testlib",
      JSON.stringify({
        token,
        methodType: OPDS1.BasicAuthType
      })
    );

    // we also trigger a loans request with the cookie
    expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
      headers: {
        Authorization: token,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      }
    });
  });
});

test("displays client error when inputs are unfilled", async () => {
  const { user } = setup(<BasicAuthHandler method={method} />);

  // don't fill form, but click login
  const loginButton = screen.getByRole("button", { name: "Login" });
  await user.click(loginButton);

  // assert
  await screen.findByText("Your Barcode is required.");
  await screen.findByText("Your Pin is required.");
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

test("displays server error", async () => {
  // set fake credentials in the cookie to trigger a fetch
  mockCookie.get.mockReturnValueOnce(
    JSON.stringify({ token: "token", methodType: "/type" })
  );
  const problemdoc: OPDS1.ProblemDocument = {
    detail: "Wrong username.",
    title: "Invalid Credentials",
    type: "/invalid-creds",
    status: 401
  };
  fetchMock.mockResponseOnce(JSON.stringify(problemdoc), {
    status: 401
  });
  setup(
    <UserProvider>
      <BasicAuthHandler method={method} />
    </UserProvider>
  );

  expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
    headers: {
      Authorization: "token",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "*"
    }
  });
  const serverError = await screen.findByText(
    "Invalid Credentials: Wrong username."
  );
  expect(serverError).toBeInTheDocument();
});

test("accepts different input labels", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(fixtures.loans));
  const methodWithLabels: ClientBasicMethod = {
    ...fixtures.basicAuthMethod,
    id: "basic-id",
    labels: {
      login: "Username",
      password: "Password"
    }
  };
  setup(<BasicAuthHandler method={methodWithLabels} />);

  expect(screen.getByLabelText("Username input")).toBeInTheDocument();
  expect(screen.getByLabelText("Password input")).toBeInTheDocument();
});

test("does not display password input when keyboard is 'No input'", async () => {
  setup(<BasicAuthHandler method={noPasswordMethod} />);

  const barcode = await screen.findByLabelText("Barcode input");
  const pin = screen.queryByLabelText("Pin input");
  expect(barcode).toBeInTheDocument();
  expect(pin).not.toBeInTheDocument();
});

test("submits with no password input", async () => {
  // give the mock a delay to allow loading state to appear
  fetchMock.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(JSON.stringify(fixtures.loans)), 100)
      )
  );
  const { user } = setup(
    <UserProvider>
      <BasicAuthHandler method={noPasswordMethod} />
    </UserProvider>
  );

  // act
  const barcode = await screen.findByLabelText("Barcode input");
  await user.type(barcode, "1234");
  const loginButton = await screen.findByRole("button", { name: "Login" });
  await user.click(loginButton);

  const token = generateCredentials("1234");

  // shows a loading state
  const loadingButton = await screen.findByLabelText("Signing in...");
  expect(loadingButton).toBeInTheDocument();
  expect(loadingButton).toBeDisabled();

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    // we set the cookie
    expect(Cookie.set).toHaveBeenCalledTimes(1);
    expect(Cookie.set).toHaveBeenCalledWith(
      // the library slug is null because we are only running with one library
      "CPW_AUTH_COOKIE/testlib",
      JSON.stringify({
        token,
        methodType: OPDS1.BasicAuthType
      })
    );

    // we also trigger a loans request with the cookie
    expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
      headers: {
        Authorization: token,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      }
    });
  });
});

describe("choose a different method NavButton", () => {
  test("displays if multiple library has multiple methods", async () => {
    setup(<BasicAuthHandler method={method} />, {
      library: {
        authMethods: [basicAuthMethod, cleverAuthMethod]
      }
    });
    const chooseAnother = screen.getByRole("link", {
      name: "Use a different login method"
    });
    expect(chooseAnother).toBeInTheDocument();
    expect(chooseAnother).toHaveAttribute(
      "href",
      "/testlib/login?nextUrl=%2Ftestlib"
    );
  });

  test("doesn't display if library only has one method", () => {
    setup(<BasicAuthHandler method={method} />, {
      library: {
        authMethods: [basicAuthMethod]
      }
    });
    const chooseAnother = screen.queryByRole("link", {
      name: "Use a different login method"
    });
    expect(chooseAnother).not.toBeInTheDocument();
  });
});
