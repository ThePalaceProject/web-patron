/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { screen, setup } from "test-utils";

import LazyImage from "../LazyImage";
import { useInView } from "react-intersection-observer";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

const HookComponent = ({
  options
}: {
  options: Parameters<typeof useInView>[0];
}) => {
  const [ref, inView] = useInView(options);
  return <div ref={ref}>{inView.toString()}</div>;
};

test("Creates an inView hook and confirms that it properly reports the element's visibility", async () => {
  setup(<HookComponent options={{}} />);

  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(true);
  screen.getByText("true");
});

test("Creates an inView hook which successfully respects the visibility ratio setting (threshold)", () => {
  setup(<HookComponent options={{ threshold: 0.3 }} />);
  mockAllIsIntersecting(0.1);
  screen.getByText("false");

  // Once the threshold has been passed, it will trigger inView.
  mockAllIsIntersecting(0.3);
  screen.getByText("true");
});

test("Confirm the presence of the src attribute when lazy image component when inView is true", () => {
  const testUrl = "http://www.yahoo.com";
  setup(<LazyImage src={testUrl} />);
  const imgElement = document.querySelector("img");
  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(true);
  expect(imgElement).toHaveAttribute("src", testUrl);
});

test("Confirm the absence of the src attribute when lazy image component when inView is true", () => {
  const testUrl = "http://www.yahoo.com";
  setup(<LazyImage src={testUrl} />);
  const imgElement = document.querySelector("img");
  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(false);
  expect(imgElement).not.toHaveAttribute("src", testUrl);
});
