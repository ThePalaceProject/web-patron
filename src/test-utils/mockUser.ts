import * as user from "components/context/UserContext";

const useUserSpy = jest.spyOn(user, "default");

const defaultUser: ReturnType<typeof user.default> = {
  isAuthenticated: true,
  loans: [],
  isLoading: false,
  status: "authenticated",
  refetchLoans: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  setBook: jest.fn(),
  error: undefined,
  token: "user-token"
};

export default function mockUser(data: Partial<typeof defaultUser> = {}) {
  const user = {
    ...defaultUser,
    ...data
  };
  useUserSpy.mockReturnValue(user);
}
