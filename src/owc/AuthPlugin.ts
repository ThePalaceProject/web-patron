import {
  AuthMethod,
  AuthCredentials,
  AuthProvider,
  AuthCallback
} from "./interfaces";

export interface AuthFormProps<T extends AuthMethod> {
  hide?: () => void;
  saveCredentials?: (credentials: AuthCredentials) => void;
  callback?: AuthCallback | null;
  cancel?: (() => void) | null;
  error?: string | null;
  provider: AuthProvider<T>;
}

export interface AuthButtonProps<T extends AuthMethod> {
  provider?: AuthProvider<T>;
  onClick?: () => void;
}

/** Applications can implement this interface if they would like to support authentication
    methods other than basic auth. A list of `AuthPlugin`s can be passed as a prop to the
    `OPDSCatalog` component. */
interface AuthPlugin<T extends AuthMethod = AuthMethod> {
  type: string;
  lookForCredentials: () => {
    credentials?: AuthCredentials;
    error?: string;
  } | null | void;
  formComponent?: React.ComponentType<AuthFormProps<T>>;

  buttonComponent: React.ComponentType<AuthButtonProps<T>>;
}

export default AuthPlugin;
