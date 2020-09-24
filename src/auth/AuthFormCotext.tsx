import * as React from "react";

/**
 * This context just tracks whether we should be showing the auth modal at any given point.
 */

const AuthFormContext = React.createContext<
  { showForm: () => void } | undefined
>(undefined);

export const AuthFormProvider: React.FC<{ showForm: () => void }> = ({
  showForm,
  children
}) => (
  <AuthFormContext.Provider value={{ showForm }}>
    {children}
  </AuthFormContext.Provider>
);

export default function useAuthFormContext() {
  const context = React.useContext(AuthFormContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useAuthFormContext must be used within an AuthFormContextProvider"
    );
  }
  return context;
}
