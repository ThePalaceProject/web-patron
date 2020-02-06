import * as React from "react";
import { action } from "@storybook/addon-actions";
import Search from "../Search";

export default {
  component: Search,
  title: "Header/Search"
};

export const DefaultSearch = () => <Search />;
