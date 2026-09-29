import * as React from "react";
import { render, screen, setup, fixtures, waitFor } from "test-utils";
import Header from "components/Header";
import { AuthCredentials, OPDS1 } from "interfaces";
import { mockSignOut } from "test-utils/fixtures/user";
import { mockPush, mockReplace } from "test-utils/mockNextRouter";
import { pinLibraries, seedCredentials } from "test-utils/pinning";
import { readPinnedLibraries } from "utils/pinnedLibraries";

const { id, slug, catalogName } = fixtures.libraryData;

test("shows a pin button for the current library", () => {
  render(<Header />);
  expect(
    screen.getByRole("button", {
      name: /^Pin .+ to My Libraries$/
    })
  ).toBeInTheDocument();
});

test("shows no pin button when pinning is disabled", () => {
  render(<Header />, { appConfig: { enablePinning: false } });
  expect(screen.queryByRole("button", { name: /My Libraries/ })).toBeNull();
});

test.each<[string, AuthCredentials["methodType"], boolean]>([
  ["signs out in place for basic auth", OPDS1.BasicAuthType, false],
  ["navigates to an unprotected page first for SAML", OPDS1.SamlAuthType, true]
])("unpinning while signed in %s", async (_, methodType, redirects) => {
  pinLibraries({ id, slug, title: catalogName });
  seedCredentials(slug);
  const { user } = setup(<Header />, {
    user: { credentials: { token: "token", methodType } }
  });

  await user.click(
    screen.getByRole("button", {
      name: `Unpin ${catalogName} from My Libraries`
    })
  );
  await user.click(
    await screen.findByRole("button", { name: "Unpin and Sign Out" })
  );

  expect(readPinnedLibraries()).toEqual([]);
  if (redirects) {
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ query: { performSignOut: "true" } })
      )
    );
    expect(mockSignOut).not.toHaveBeenCalled();
  } else {
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  }
});

test("finishes a redirect sign-out when the page loads with performSignOut", async () => {
  render(<Header />, {
    user: { isAuthenticated: true },
    router: { query: { performSignOut: "true" } }
  });

  await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  expect(mockReplace).toHaveBeenCalledWith(
    expect.stringContaining("/signed-out")
  );
});
