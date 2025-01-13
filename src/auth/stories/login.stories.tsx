import React from "react";
// import { StoryFn, Meta } from "@storybook/react";
import { StoryFn, Meta } from "@storybook/react";
import Login from "auth/LoginWrapper";

/**
 * What are the stories we need?
 *  - loading user state
 *  - no auth methods available
 *  - only one auth method (should be auto-selected)
 *  - 1-5 auth methods (buttons)
 *  - >5 auth methods (combobox)
 *  - selected method (handler)
 *    - SAML
 *    - Clever
 *    - Firstbook
 */

export default {
  title: "Pages/Login",
  component: Login
} as Meta;

const Template: StoryFn = ({ children, ...rest }) => (
  <Login {...rest}>{children}</Login>
);

export const Basic = Template.bind({});
Basic.parameters = {
  config: {
    companionApp: "openebooks"
  }
};
