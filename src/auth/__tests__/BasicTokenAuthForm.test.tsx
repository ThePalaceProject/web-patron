import BasicTokenAuthHandler from "auth/BasicTokenAuthHandler";
import { UserProvider } from "components/context/UserContext";
import { OPDS1 } from "interfaces";
import Cookie from "js-cookie";
import * as React from "react";
import { fixtures, screen, setup, waitFor } from "test-utils";
import {
  basicTokenAuthenticationUrl,
  basicTokenAuthMethod
} from "test-utils/fixtures";
import { generateCredentials } from "utils/auth";

const accessToken = "IaMaBeArErToKeN";

beforeEach(() => fetchMock.resetMocks());

test("displays form", async () => {
  const { user } = setup(
    <BasicTokenAuthHandler method={basicTokenAuthMethod} />
  );

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

test("toggle password visibility", async () => {
  const { user } = setup(
    <BasicTokenAuthHandler method={basicTokenAuthMethod} />
  );

  // Input initially renders as password input
  const input = await screen.findByLabelText("Pin input");
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute("type", "password");

  const showPasswordIconButton = await screen.findByLabelText("show password");
  expect(showPasswordIconButton).toHaveAttribute("type", "button");
  await user.click(showPasswordIconButton);

  // After toggle, input becomes text so password is visible
  const hidePasswordIconButton = await screen.findByLabelText("hide password");
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute("type", "text");
  expect(hidePasswordIconButton).toBeInTheDocument();
});

test("submit by clicking login button", async () => {
  // give the mock a delay to allow loading state to appear

  fetchMock
    // Receive token from auth
    .once(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve(
                JSON.stringify({
                  accessToken: accessToken,
                  expiresIn: 3600,
                  tokenType: "Bearer"
                })
              ),
            100
          )
        )
    )
    .once(
      // Get loans using token
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve(JSON.stringify(fixtures.loans)), 100)
        )
    );

  const { user } = setup(
    <UserProvider>
      <BasicTokenAuthHandler method={basicTokenAuthMethod} />
    </UserProvider>
  );

  // act
  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  await user.type(barcode, "1234");
  await user.type(pin, "pinpin");
  const loginButton = screen.getByRole("button", { name: "Login" });
  await user.click(loginButton);

  const basicToken = generateCredentials("1234", "pinpin");

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
        token: {
          basicToken: basicToken,
          bearerToken: `Bearer ${accessToken}`
        },
        authenticationUrl: basicTokenAuthenticationUrl,
        methodType: OPDS1.BasicTokenAuthType
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call grabs token from /patrons/me/token using username and password
    expect(fetchMock).toHaveBeenNthCalledWith(1, basicTokenAuthenticationUrl, {
      headers: {
        Authorization: basicToken,
        "X-Requested-With": "XMLHttpRequest"
      },
      method: "POST"
    });

    // Second call to get loans with Bearer Token
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/shelf-url", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });
  });
});
