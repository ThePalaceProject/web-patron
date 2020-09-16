import DataFetcher from "owc/DataFetcher";
import ActionsCreator from "owc/actions";
import { adapter } from "owc/OPDSDataAdapter";

export default function getActions() {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionsCreator(fetcher);

  return { actions, fetcher };
}
