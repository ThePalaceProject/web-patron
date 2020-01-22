import * as React from "react";
import complaintsReducer, {
  initState,
  ComplaintsState
} from "../../reducers/complaints";
import useThunkReducer from "../../hooks/useThunkReducer";

export const ComplaintsStateContext = React.createContext<
  ComplaintsState | undefined
>(undefined);
export const ComplaintsDispatchContext = React.createContext<
  React.Dispatch<any> | undefined
>(undefined);

export const ComplaintsContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useThunkReducer(complaintsReducer, initState);

  return (
    <ComplaintsStateContext.Provider value={state}>
      <ComplaintsDispatchContext.Provider value={dispatch}>
        {children}
      </ComplaintsDispatchContext.Provider>
    </ComplaintsStateContext.Provider>
  );
};

function useComplaintsState() {
  const state = React.useContext(ComplaintsStateContext);
  const dispatch = React.useContext(ComplaintsDispatchContext);
  // const { actions, dispatch: _unusedOpdsDispatch } = useActi/ons();

  if (typeof state === "undefined" || typeof dispatch === "undefined") {
    throw new Error(
      "useComplaintsState must be used within a ComplaintsContextProvider"
    );
  }
  return {
    complaintsState: state,
    complaintsDispatch: dispatch
    // recommendationsActions: actions
  };
}

export default useComplaintsState;
