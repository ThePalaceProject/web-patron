import * as React from "react";
import computeBreadcrumbs from "../computeBreadcrumbs";
import useTypedSelector from "./useTypedSelector";

/**
 * custom hook to compute breadcrumbs
 */
export default function useBreadCrumbs() {
  const collection = useTypedSelector(state => state.collection.data);
  const history = useTypedSelector(state => state.collection.history);
  const breadcrumbs = computeBreadcrumbs(collection, history);
  return breadcrumbs;
}
