import * as React from "react";
import { action } from "@storybook/addon-actions";
import Select from "../Select";

export default {
  component: Select,
  title: "Form/Select"
};

export const Default = () => (
  <Select>
    <option value="option 1">Option 1</option>
    <option value="option 2">Option 2</option>
    <option value="option 3">Option 3</option>
  </Select>
);
