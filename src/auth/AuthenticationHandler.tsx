import React from "react";
import BasicAuthHandler from "./BasicAuthHandler";
import BasicTokenAuthHandler from "./BasicTokenAuthHandler";
import CleverAuthHandler from "./CleverAuthHandler";
import SamlAuthHandler from "./SamlAuthHandler";
import {
  ClientBasicMethod,
  ClientBasicTokenMethod,
  ClientSamlMethod
} from "interfaces";
import {
  BasicAuthType,
  CleverAuthType,
  CleverAuthMethod,
  SamlAuthType,
  BasicTokenAuthType
} from "../types/opds1";
import track from "../analytics/track";
import ApplicationError from "../errors";

type SupportedAuthTypes =
  | typeof BasicAuthType
  | typeof BasicTokenAuthType
  | typeof SamlAuthType
  | typeof CleverAuthType;

type SupportedAuthHandlerProps = {
  [key in SupportedAuthTypes]: key extends typeof BasicAuthType
    ? ClientBasicMethod
    : key extends typeof BasicTokenAuthType
    ? ClientBasicTokenMethod
    : key extends typeof SamlAuthType
    ? ClientSamlMethod
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
  [CleverAuthType]: CleverAuthHandler
};

export const isSupportedAuthType = (type: string): boolean =>
  type in authHandlers;

interface AuthHandlerWrapperProps {
  method: { type: SupportedAuthTypes } & any;
}

const AuthenticationHandler: React.ComponentType<AuthHandlerWrapperProps> = ({
  method
}) => {
  const _AuthHandler = authHandlers[method.type];

  if (method.type === BasicTokenAuthType && typeof method !== "string") {
    return <_AuthHandler method={method as ClientBasicTokenMethod} />;
  } else if (method.type === BasicAuthType && typeof method !== "string") {
    return <_AuthHandler method={method as ClientBasicMethod} />;
  } else if (method.type === SamlAuthType && typeof method !== "string") {
    return <_AuthHandler method={method as ClientSamlMethod} />;
  } else if (method.type === CleverAuthType && typeof method !== "string") {
    return <_AuthHandler method={method as CleverAuthMethod} />;
  } else {
    // We should never get here, but if we do, we want to know about it.
    // We'll log it and render a helpful message to the user.
    track.error(
      new ApplicationError({
        title: "Login Method Not Supported",
        detail: `Failed to render what should be a supported authentication method. Is the LoginPicker method filtering correctly configured? Method ID: ${method.id}`
      })
    );
    return <p>This authentication method is not supported.</p>;
  }
};

export default AuthenticationHandler;
