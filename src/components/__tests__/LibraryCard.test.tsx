import * as React from "react";
import { fireEvent, render, screen } from "test-utils";
import LibraryCard from "components/LibraryCard";

function renderCard(props: Partial<React.ComponentProps<typeof LibraryCard>>) {
  return render(
    <LibraryCard {...props}>
      {actionProps => (
        <a href="https://example.com/abc" {...actionProps}>
          ABC Library
        </a>
      )}
    </LibraryCard>
  );
}

test("renders logo image without alternative text when logoUrl is given", () => {
  renderCard({ logoUrl: "https://example.com/logo.png" });
  const img = screen.getByRole("presentation");
  expect(img).toHaveAttribute("src", "https://example.com/logo.png");
  expect(img).toHaveAttribute("alt", "");
});

test("renders the default logo hidden from assistive tech when there is no logo", () => {
  renderCard({});
  expect(screen.getByTestId("default-library-logo")).toHaveAttribute(
    "aria-hidden",
    "true"
  );
  expect(screen.queryByRole("presentation")).toBeNull();
});

test("falls back to the default logo when the logo fails to load", () => {
  renderCard({ logoUrl: "https://example.com/missing.png" });
  expect(screen.queryByTestId("default-library-logo")).toBeNull();
  fireEvent.error(screen.getByRole("presentation"));
  expect(screen.queryByRole("presentation")).toBeNull();
  expect(screen.getByTestId("default-library-logo")).toBeInTheDocument();
});

test("describes the action with the description", () => {
  renderCard({ description: "Serving Anytown." });
  expect(
    screen.getByRole("link", { name: "ABC Library" })
  ).toHaveAccessibleDescription("Serving Anytown.");
});

test("adds no description reference when there is no description", () => {
  renderCard({});
  expect(screen.getByRole("link", { name: "ABC Library" })).not.toHaveAttribute(
    "aria-describedby"
  );
});

test("renders trailing content outside the action", () => {
  renderCard({ trailing: <button>Pin</button> });
  expect(screen.getByRole("button", { name: "Pin" })).not.toHaveAttribute(
    "data-library-card-action"
  );
  expect(screen.getByRole("link", { name: "ABC Library" })).toBeInTheDocument();
});

test("renders the footer", () => {
  renderCard({ footer: <button>OK</button> });
  expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
});
