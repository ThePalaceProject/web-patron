import * as React from "react";
import { ClientSamlMethod } from "interfaces";
import { clientOnly } from "components/ClientOnly";
import { RedirectAuthHandler } from "auth/RedirectAuthHandler";

export const samlRedirectFlag = (id: string) => `cpw-saml-redirect-${id}`;
export const samlCancelFlag = (id: string) => `cpw-saml-cancelled-${id}`;

/*
 * force_authn=true tells the Circulation Manager to set ForceAuthn on the
 * SAML AuthnRequest, making the IdP re-authenticate the user instead of
 * reusing an existing session.
 */
const switchAccountParam = { name: "force_authn", value: "true" };

/**
 * The SAML Auth handler sends you off to an external website to complete
 * auth.
 */
const SamlAuthHandler: React.FC<{ method: ClientSamlMethod }> = ({
  method
}) => (
  <RedirectAuthHandler
    method={method}
    redirectFlagKey={samlRedirectFlag(method.id)}
    cancelFlagKey={samlCancelFlag(method.id)}
    switchAccountParam={switchAccountParam}
  />
);

export default clientOnly(SamlAuthHandler);
