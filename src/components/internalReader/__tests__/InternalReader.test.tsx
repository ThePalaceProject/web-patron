import { render } from "test-utils";
import InternalReader from "..";

test("renders dialog header with Back button", () => {
  const utils = render(<InternalReader />);
  expect(
    utils.getByRole("button", {
      name: "Back"
    })
  ).toBeInTheDocument();
});

test("shows loading spinner on initial page render", () => {
  const utils = render(<InternalReader />);
  expect(
    utils.getByRole("img", {
      name: "Loading"
    })
  ).toBeInTheDocument();
});
