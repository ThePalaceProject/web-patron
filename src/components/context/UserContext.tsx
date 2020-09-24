import useCredentials from "auth/useCredentials";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import { AppAuthMethod, BookData } from "interfaces";
import * as React from "react";
import useSWR from "swr";

type Status = "authenticated" | "loading" | "unauthenticated";
type UserState = {
  loans: BookData[] | undefined;
  status: Status;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => void;
  signIn: (token: string, method: AppAuthMethod) => void;
  signOut: () => void;
  // manually sets a book in the loans. For use after borrowing.
  setBook: (book: BookData) => void;
  error: any;
};

const UserContext = React.createContext<UserState | undefined>(undefined);

/**
 * Here we fetch the loans and provide functions to sign in
 * and sign out. Calling mutate() will invalidate the SWR
 * cache and therefore cause a refetch. The key to the cache
 * includes the shelfUrl, token and auth method type, so if any of
 * those change it will cause a refetch.
 */
export const UserProvider: React.FC = ({ children }) => {
  const { shelfUrl, slug } = useLibraryContext();
  const { credentials, setCredentials, clearCredentials } = useCredentials(
    slug
  );
  const { data, mutate, isValidating, error } = useSWR(
    // pass null if there are no credentials to tell SWR not to fetch at all.
    credentials
      ? [shelfUrl, credentials?.token, credentials?.methodType]
      : null,
    fetchCollection,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // clear credentials whenever we receive a 401
      onError: err => {
        if (err instanceof ServerError && err?.status === 401) {
          // clearCredentials();
        }
      }
    }
  );

  function signIn(token: string, method: AppAuthMethod) {
    setCredentials({ token, methodType: method.type });
    mutate();
  }
  function signOut() {
    clearCredentials();
    mutate();
  }
  function setBook(book: BookData) {
    /**
     * If there is already some loan data, add the new checked out
     * book to the cache manually, and don't refetch loans.
     * If there is no loan data yet, just call mutate to trigger a
     * fresh refetch
     */
    if (data) {
      mutate(
        {
          ...data,
          books: [...data?.books, book]
        },
        false
      );
    } else {
      mutate();
    }
  }

  /**
   * We should only ever be in one of these three states.
   */
  const status: Status =
    data && credentials
      ? "authenticated"
      : credentials && isValidating
      ? "loading"
      : "unauthenticated";

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = {
    status,
    isAuthenticated,
    isLoading,
    loans: isAuthenticated ? data?.books ?? [] : undefined,
    refetch: mutate,
    signIn,
    signOut,
    setBook,
    error
  };
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default function useUser() {
  const context = React.useContext(UserContext);
  if (typeof context === "undefined") {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
