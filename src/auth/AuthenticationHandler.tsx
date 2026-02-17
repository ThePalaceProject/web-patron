import React from "react";
import BasicAuthHandler from "./BasicAuthHandler";
import BasicTokenAuthHandler from "./BasicTokenAuthHandler";
import CleverAuthHandler from "./CleverAuthHandler";
import SamlAuthHandler from "./SamlAuthHandler";
import OidcAuthHandler from "./OidcAuthHandler";
import {
  ClientBasicMethod,
  ClientBasicTokenMethod,
  ClientSamlMethod,
  ClientOidcMethod
} from "interfaces";
import {
  BasicAuthType,
  CleverAuthType,
  CleverAuthMethod,
  SamlAuthType,
  OidcAuthType,
  BasicTokenAuthType
} from "../types/opds1";
import track from "../analytics/track";
import ApplicationError from "../errors";

type SupportedAuthTypes =
  | typeof BasicAuthType
  | typeof BasicTokenAuthType
  | typeof SamlAuthType
  | typeof OidcAuthType
  | typeof CleverAuthType;

type SupportedAuthHandlerProps = {
  [key in SupportedAuthTypes]: key extends typeof BasicAuthType
    ? ClientBasicMethod
    : key extends typeof BasicTokenAuthType
      ? ClientBasicTokenMethod
      : key extends typeof SamlAuthType
        ? ClientSamlMethod
        : key extends typeof OidcAuthType
          ? ClientOidcMethod
          : key extends typeof CleverAuthType
            ? CleverAuthMethod
            : never;
};

// Canonical map of auth types to their respective handler components.
// All auth types should be listed here, so that they can be
// considered for use. Types not listed here will not be used.
export const authHandlers: {
  [key in SupportedAuthTypes]: React.ComponentType<{
    method: SupportedAuthHandlerProps[key];
  }>;
} = {
  [BasicAuthType]: BasicAuthHandler,
  [BasicTokenAuthType]: BasicTokenAuthHandler,
  [SamlAuthType]: SamlAuthHandler,
  [OidcAuthType]: OidcAuthHandler,
  [CleverAuthType]: CleverAuthHandler
};

export const isSupportedAuthType = (type: string): boolean =>
  type in authHandlers;

interface AuthHandlerWrapperProps {
  method: { type: SupportedAuthTypes } & any;
}

const getSupportedAuthMethod = (method: any) => {
  switch (method.type) {
    case BasicTokenAuthType:
      return method as ClientBasicTokenMethod;
    case BasicAuthType:
      return method as ClientBasicMethod;
    case SamlAuthType:
      return method as ClientSamlMethod;
    case OidcAuthType:
      return method as ClientOidcMethod;
    case CleverAuthType:
      return method as CleverAuthMethod;
    default:
      return undefined;
  }
};

const AuthenticationHandler: React.ComponentType<AuthHandlerWrapperProps> = ({
  method
}) => {
  const _AuthHandler = authHandlers[method.type];
  const supportedMethod = getSupportedAuthMethod(method);

  if (supportedMethod) {
    return <_AuthHandler method={supportedMethod} />;
  }

  // We should never get here, but if we do, we want to know about it.
  // We'll log it and render a helpful message to the user.
  track.error(
    new ApplicationError({
      title: "Login Method Not Supported",
      detail: `Failed to render what should be a supported authentication method. Is the Login method filtering correctly configured? Method ID: ${method.id}`
    })
  );
  return <p>This authentication method is not supported.</p>;
};
export default AuthenticationHandler;
