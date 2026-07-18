import * as React from "react";
import { ClientOidcMethod } from "interfaces";
import { clientOnly } from "components/ClientOnly";
import { RedirectAuthHandler } from "auth/RedirectAuthHandler";

export const oidcRedirectFlag = (id: string) => `cpw-oidc-redirect-${id}`;
export const oidcCancelFlag = (id: string) => `cpw-oidc-cancelled-${id}`;

/*
 * prompt=select_account asks the OIDC provider to show its account chooser
 * instead of silently reusing an existing session.
 */
const switchAccountParam = { name: "prompt", value: "select_account" };

/**
 * The OIDC Auth handler sends you off to an external website to complete
 * auth.
 */
const OidcAuthHandler: React.FC<{ method: ClientOidcMethod }> = ({
  method
}) => (
  <RedirectAuthHandler
    method={method}
    redirectFlagKey={oidcRedirectFlag(method.id)}
    cancelFlagKey={oidcCancelFlag(method.id)}
    switchAccountParam={switchAccountParam}
  />
);

export default clientOnly(OidcAuthHandler);
