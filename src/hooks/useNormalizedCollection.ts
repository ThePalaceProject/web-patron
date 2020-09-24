import useTypedSelector from "./useTypedSelector";
import { collectionDataWithLoans } from "owc/utils";
import useUser from "components/context/UserContext";

/**
 * A hook to give you the book state that has been updated with
 * loan data if any exists
 */

export default function useNormalizedCollection() {
  const collectionData = useTypedSelector(state => state.collection.data);
  const { loans } = useUser();

  return collectionDataWithLoans(collectionData, loans);
}
