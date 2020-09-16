import useTypedSelector from "./useTypedSelector";
import { collectionDataWithLoans } from "owc/utils";

/**
 * A hook to give you the book state that has been updated with
 * loan data if any exists
 */

export default function useNormalizedCollection() {
  const collectionData = useTypedSelector(state => state.collection.data);
  const loans = useTypedSelector(state => state.loans.books);

  return collectionDataWithLoans(collectionData, loans);
}
