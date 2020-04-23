import { TypedUseSelectorHook, useSelector } from "react-redux";
import { State } from "opds-web-client/lib/state";

/**
 * A hook to access redux data that is properly typed with the
 * app's root state
 */

const useTypedSelector: TypedUseSelectorHook<State> = useSelector;

export default useTypedSelector;
