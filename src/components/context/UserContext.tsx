import { fetchAuthToken } from "auth/fetch";
import useCredentials from "auth/useCredentials";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import { AppAuthMethod, AnyBook, AuthCredentials, Token } from "interfaces";
import * as React from "react";
import useSWR from "swr";
import { BasicTokenAuthType } from "types/opds1";

type Status = "authenticated" | "loading" | "unauthenticated";
export type UserState = {
  loans: AnyBook[] | undefined;
  status: Status;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchLoans: () => void;
  signIn: (
    token: string,
    method: AppAuthMethod,
    authenticationUrl: string | undefined
  ) => void;
  signOut: () => void;
  setBook: (book: AnyBook, id?: string) => void;
  error: any;
  token: string | undefined;
  clearCredentials: () => void;
};

export const UserContext = React.createContext<UserState | undefined>(
  undefined
);

interface UserProviderProps {
  children: React.ReactNode;
}

/**
 * Here we fetch the loans and provide functions to sign in
 * and sign out. Calling mutate() will invalidate the SWR
 * cache and therefore cause a refetch. The key to the cache
 * includes the shelfUrl, token and auth method type, so if any of
 * those change it will cause a refetch.
 */
export const UserProvider = ({ children }: UserProviderProps) => {
  const { shelfUrl, slug } = useLibraryContext();
  const { credentials, setCredentials, clearCredentials } = useCredentials(
    slug
  );
  const [error, setError] = React.useState<ServerError | null>(null);

  const token = stringifyToken(credentials);
  const { data, mutate, isValidating } = useSWR(
    // pass null if there are no credentials or shelfUrl to tell SWR not to fetch at all.
    credentials && shelfUrl ? [shelfUrl, token, credentials?.methodType] : null,
    fetchLoans,
    {
      shouldRetryOnError: credentials?.methodType === BasicTokenAuthType,
      revalidateOnFocus: credentials?.methodType === BasicTokenAuthType,
      revalidateOnReconnect: false,
      errorRetryCount: credentials?.methodType === BasicTokenAuthType ? 1 : 0,
      // Try and fetch new token once old token has expired
      onErrorRetry: async (err, _key, _config, revalidate) => {
        if (err instanceof ServerError && err?.info.status === 401) {
          if (credentials?.methodType === BasicTokenAuthType) {
            try {
              const { accessToken } = await fetchAuthToken(
                credentials?.authenticationUrl,
                stringifyToken(credentials, "basicToken")
              );
              setCredentials({
                authenticationUrl: credentials?.authenticationUrl,
                methodType: credentials.methodType,
                token: {
                  bearerToken: `Bearer ${accessToken}`,
                  basicToken: stringifyToken(credentials, "basicToken")
                }
              });
              revalidate();
            } catch (err) {
              setError(err);
              clearCredentials();
            }
          }
        }
      },
      // clear credentials whenever we receive a 401, but save the error so it sticks around.
      // however, BasicTokenAuthType methods are retried in onErrorRetry to get new token
      onError: err => {
        if (err instanceof ServerError && err?.info.status === 401) {
          if (credentials?.methodType !== BasicTokenAuthType) {
            setError(err);
            clearCredentials();
          }
        }
      }
    }
  );

  function signIn(
    token: string | Token,
    method: AppAuthMethod,
    authenticationUrl: string | undefined
  ) {
    setCredentials({ token, authenticationUrl, methodType: method.type });
    mutate();
  }

  function signOut() {
    clearCredentials();
    mutate();
  }

  function setBook(book: AnyBook, id?: string) {
    const existing = data ?? [];

    // if the id exists, remove that book and set the new one
    const withoutOldBook = existing.filter(book => book.id !== id);
    const newData: AnyBook[] = [...withoutOldBook, book];
    mutate(newData);
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
  const user: UserState = {
    status,
    isAuthenticated,
    isLoading,
    loans: isAuthenticated ? data ?? [] : undefined,
    refetchLoans: mutate,
    signIn,
    signOut,
    setBook,
    error,
    token: stringifyToken(credentials),
    clearCredentials
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

// we only need the books out of a collection for loans,
// so this is a utility to extract those.
async function fetchLoans(url: string, token: string) {
  const collection = await fetchCollection(url, token);
  return collection.books;
}

function stringifyToken(
  credentials: AuthCredentials | undefined,
  tokenType: string = "bearerToken"
): string | undefined {
  if (
    credentials?.methodType === BasicTokenAuthType &&
    typeof credentials?.token === "object"
  ) {
    return credentials?.token?.[tokenType] ?? undefined;
  }

  return typeof credentials?.token === "string" ? credentials.token : undefined;
}
