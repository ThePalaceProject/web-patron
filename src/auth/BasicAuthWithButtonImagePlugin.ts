import AuthPlugin from "opds-web-client/lib/AuthPlugin";
// import BasicAuthForm from "opds-web-client/lib/components/BasicAuthForm";
import BasicAuthButtonWithImage from "./components/BasicAuthButtonWithImage";
import BasicAuthForm from "../components/BasicAuthForm";

const BasicAuthWithButtonImagePlugin: AuthPlugin = {
  type: "http://opds-spec.org/auth/basic",

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  lookForCredentials: () => {},

  formComponent: BasicAuthForm,
  buttonComponent: BasicAuthButtonWithImage
};

export default BasicAuthWithButtonImagePlugin;
