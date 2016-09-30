import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import BasicAuthForm from "opds-web-client/lib/components/BasicAuthForm";
import FirstBookButton from "./components/FirstBookButton";

const FirstBookAuthPlugin: AuthPlugin = {
  type: "http://opds-spec.org/auth/basic",

  lookForCredentials: () => {},

  formComponent: BasicAuthForm,
  buttonComponent: FirstBookButton
};

export = FirstBookAuthPlugin;