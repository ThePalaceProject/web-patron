import * as React from "react";
import collection, {
  initialState
} from "opds-web-client/lib/reducers/collection";
import useThunkReducer from "../../hooks/useThunkReducer";

export const RecommendationsStateContext = React.createContext(null);
export const RecommendationsDispatchContext = React.createContext(null);

export const RecommendationsContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useThunkReducer(collection, initialState);

  return (
    <RecommendationsStateContext.Provider value={state}>
      <RecommendationsDispatchContext.Provider value={dispatch}>
        {children}
      </RecommendationsDispatchContext.Provider>
    </RecommendationsStateContext.Provider>
  );
};

const useRecommendationsState = () => {
  const state = React.useContext(RecommendationsStateContext);
  const dispatch = React.useContext(RecommendationsDispatchContext);
  // possibly bind all the actions with dispatch here?
  return [state, dispatch];
};

export default useRecommendationsState;
