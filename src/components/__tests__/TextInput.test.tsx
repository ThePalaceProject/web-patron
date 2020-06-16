/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { render } from "../../test-utils";
import TextInput, { TextArea } from "../TextInput";

test("TextInput renders properly and passes styles through", () => {
  const node = render(<TextInput sx={{ color: "red" }} />);
  expect(node.container.firstChild).toMatchSnapshot();

  expect(node.container.firstChild).toHaveStyle("color: red");
});

test("type textarea renders properly and passes styles throug", () => {
  const node = render(<TextArea sx={{ color: "maroon" }} />);
  expect(node.container.firstChild).toMatchSnapshot();
  expect(node.container.firstChild).toHaveStyle("color: maroon");
});
