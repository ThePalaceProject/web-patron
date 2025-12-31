import { jest } from "@jest/globals";
import { UserState } from "components/context/UserContext";

export const mockRefetchLoans = jest.fn();
export const mockSignIn = jest.fn();
export const mockSignOut = jest.fn(() => undefined);
export const mockSetBook = jest.fn();
export const mockClearCredentials = jest.fn();

export const user: Partial<UserState> = {
  error: undefined,
  isAuthenticated: false,
  isLoading: false,
  loans: undefined,
  refetchLoans: mockRefetchLoans,
  signIn: mockSignIn,
  signOut: mockSignOut,
  setBook: mockSetBook,
  status: "unauthenticated",
  clearCredentials: mockClearCredentials() as () => void,
  token: "user-token",
  credentials: undefined
};
