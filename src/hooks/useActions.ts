import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import ActionsCreator from "opds-web-client/lib/actions";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

/**
 * Will set up the data fetcher, initialize the actions
 * and return them.
 */
function useActions() {
  /**
   * create a new DataFetcher and ActionsCreator. Maybe we want to
   *  need to memoize these?
   *
   * do we need to include the proxyUrl?
   */
  const fetcher = new DataFetcher({
    proxyUrl: null,
    adapter
  });

  const actions = new ActionsCreator(fetcher);

  const dispatch = useDispatch();

  return { actions, dispatch };
}

export default useActions;
