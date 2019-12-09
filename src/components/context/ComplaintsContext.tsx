import * as React from "react";
import complaintsReducer, { initState } from "../../reducers/complaints";
import useThunkReducer from "../../hooks/useThunkReducer";

export const ComplaintsStateContext = React.createContext(null);
export const ComplaintsDispatchContext = React.createContext(null);

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

const useComplaintsState = () => {
  const state = React.useContext(ComplaintsStateContext);
  const dispatch = React.useContext(ComplaintsDispatchContext);
  // possibly bind all the actions with dispatch here?
  return [state, dispatch];
};

export default useComplaintsState;
