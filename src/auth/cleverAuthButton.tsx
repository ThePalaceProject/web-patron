import * as React from "react";
import { AuthMethod } from "owc/interfaces";
import { useActions } from "owc/ActionsContext";
import Button from "components/Button";
import { modalButtonStyles } from "components/Modal";
import { AuthButtonProps } from "owc/AuthPlugin";

const CleverButton: React.FC<AuthButtonProps<AuthMethod>> = ({ provider }) => {
  const { actions, dispatch } = useActions();

  const currentUrl = window.location.origin + window.location.pathname;

  const imageUrl = (provider?.method.links || []).find(
    link => link.rel === "logo"
  )?.href;
  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = `${
    (provider?.method.links || []).find(link => link.rel === "authenticate")
      ?.href
  }&redirect_uri=${encodeURIComponent(encodeURIComponent(currentUrl))}`;

  return authUrl ? (
    <a href={authUrl}>
      <Button
        onClick={() =>
          dispatch(
            actions.saveAuthCredentials({
              provider: "Clever",
              credentials: ""
            })
          )
        }
        type="submit"
        sx={{
          ...modalButtonStyles,
          color: "#ffffff",
          backgroundColor: "#2f67aa",
          backgroundImage: `url(${imageUrl})`
        }}
        aria-label="Log In with Clever"
      >
        {!imageUrl ? "Log In With Clever" : ""}
      </Button>
    </a>
  ) : null;
};

export default CleverButton;
