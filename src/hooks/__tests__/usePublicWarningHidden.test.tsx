import * as React from "react";
import { act, render, screen } from "test-utils";
import usePublicWarningHidden from "hooks/usePublicWarningHidden";
import { hidePublicWarning, showPublicWarning } from "utils/publicWarning";

function Probe() {
  return <span>{String(usePublicWarningHidden())}</span>;
}

test("tracks the stored preference and updates on changes in this tab", () => {
  render(<Probe />);
  expect(screen.getByText("false")).toBeInTheDocument();

  act(() => hidePublicWarning());
  expect(screen.getByText("true")).toBeInTheDocument();

  act(() => showPublicWarning());
  expect(screen.getByText("false")).toBeInTheDocument();
});

test("server rendering reports false even when the opt-out is stored", () => {
  // The plain react-dom/server entry resolves to the browser build under
  // jsdom and needs MessageChannel; the node build schedules without it.
  const { renderToString } = jest.requireActual<
    typeof import("react-dom/server")
  >("react-dom/server.node");

  hidePublicWarning();
  expect(renderToString(<Probe />)).toContain("false");
});
