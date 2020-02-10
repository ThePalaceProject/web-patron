import * as React from "react";
import useTypedSelector from "./useTypedSelector";

/**
 * Returns auth data from state. Simple hook, but useful abstraction
 * we can build on and will help if we want to change how signedIn
 * is calculated
 */
function useAuth() {
  const isSignedIn = useTypedSelector(state => !!state?.auth?.credentials);

  return { isSignedIn };
}

export default useAuth;
