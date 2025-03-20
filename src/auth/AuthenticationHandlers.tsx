import React from "react";
import BasicAuthHandler from "./BasicAuthHandler";
import CleverAuthHandler from "./CleverAuthHandler";
import SamlAuthHandler from "./SamlAuthHandler";
import { ClientBasicMethod, ClientSamlMethod } from "interfaces";
import {
  BasicAuthType,
  CleverAuthType,
  CleverAuthMethod,
  SamlAuthType
} from "../types/opds1";

type SupportedAuthTypes =
  | typeof BasicAuthType
  | typeof SamlAuthType
  | typeof CleverAuthType;

type AuthHandlerProps = {
  [key in SupportedAuthTypes]: key extends typeof BasicAuthType
    ? ClientBasicMethod
    : key extends typeof SamlAuthType
    ? ClientSamlMethod
    : key extends typeof CleverAuthType
    ? CleverAuthMethod
    : never;
};

// Canonical map of auth types to their respective handler components.
// All auth types should be listed here, so that they can be
// considered for use. Types not listed here will not be used.
const authHandlers: {
  [key in SupportedAuthTypes]: React.FC<{ method: AuthHandlerProps[key] }>;
} = {
  [BasicAuthType]: BasicAuthHandler,
  [SamlAuthType]: SamlAuthHandler,
  [CleverAuthType]: CleverAuthHandler
};

export const isSupportedAuthType = (type: string): boolean =>
  type in authHandlers;

interface AuthHandlerWrapperProps {
  method: { type: SupportedAuthTypes } & any;
}

export const AuthHandlerWrapper: React.ComponentType<AuthHandlerWrapperProps> = ({
  method
}) => {
  const AuthHandler = authHandlers[method.type];

  if (method.type === BasicAuthType && typeof method !== "string") {
    return <AuthHandler method={method as ClientBasicMethod} />;
  } else if (method.type === SamlAuthType && typeof method !== "string") {
    return <AuthHandler method={method as ClientSamlMethod} />;
  } else if (method.type === CleverAuthType && typeof method !== "string") {
    return <AuthHandler method={method as CleverAuthMethod} />;
  } else {
    return null;
  }
};

export default authHandlers;
