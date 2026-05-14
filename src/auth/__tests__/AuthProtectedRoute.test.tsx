import * as React from "react";
import { render, waitFor } from "test-utils";
import AuthProtectedRoute from "../AuthProtectedRoute";

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders children when authenticated", () => {
  const utils = render(
    <AuthProtectedRoute>
      <div>Protected content</div>
    </AuthProtectedRoute>,
    { user: { isAuthenticated: true, token: "some-token", isLoading: false } }
  );

  expect(utils.getByText("Protected content")).toBeInTheDocument();
});

test("shows loading state while auth is in progress", () => {
  const utils = render(
    <AuthProtectedRoute>
      <div>Protected content</div>
    </AuthProtectedRoute>,
    { user: { isAuthenticated: false, isLoading: true } }
  );

  expect(utils.getByText("Loading...")).toBeInTheDocument();
  expect(utils.queryByText("Protected content")).not.toBeInTheDocument();
});

test("redirects unauthenticated user to login", async () => {
  const mockReplace = jest.fn();

  render(
    <AuthProtectedRoute>
      <div>Protected content</div>
    </AuthProtectedRoute>,
    {
      user: { token: undefined, isAuthenticated: false, isLoading: false },
      router: { replace: mockReplace }
    }
  );

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/[library]/login",
        query: expect.objectContaining({ library: "testlib" })
      }),
      undefined,
      { shallow: true }
    );
  });
  // error param from IdP must not travel into the login URL
  expect(mockReplace.mock.calls[0][0].query).not.toHaveProperty("error");
});

test("passes IdP error to login URL when query.error is present", async () => {
  const mockReplace = jest.fn();

  render(
    <AuthProtectedRoute>
      <div>Protected content</div>
    </AuthProtectedRoute>,
    {
      user: { token: undefined, isAuthenticated: false, isLoading: false },
      router: {
        replace: mockReplace,
        query: { error: "access_denied", library: "testlib" }
      }
    }
  );

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/[library]/login",
        query: expect.objectContaining({ loginError: "access_denied" })
      }),
      undefined,
      { shallow: true }
    );
  });
  // the raw IdP error param must be stripped, not forwarded as-is
  expect(mockReplace.mock.calls[0][0].query).not.toHaveProperty("error");
});

test("does not redirect when authenticated", async () => {
  const mockReplace = jest.fn();

  render(
    <AuthProtectedRoute>
      <div>Protected content</div>
    </AuthProtectedRoute>,
    {
      user: { isAuthenticated: true, token: "some-token", isLoading: false },
      router: { replace: mockReplace }
    }
  );

  // Allow effects to flush
  await waitFor(() => {
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
