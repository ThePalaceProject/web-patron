import * as React from "react";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";

export default function useBorrow() {
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const { actions, dispatch } = useActions();

  const borrowOrReserve = async (url: string | undefined) => {
    if (url) {
      setLoading(true);
      await dispatch(actions.updateBook(url));
      if (!isUnmounted.current) setLoading(false);
    } else {
      throw Error("No borrow url present for book");
    }
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    borrowOrReserve,
    errorMsg
  };
}
