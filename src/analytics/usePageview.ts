import * as React from "react";
import { Router } from "next/router";
import { pageView } from "analytics/track";

function usePageview() {
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageView(url);
    };
    Router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
}

export default usePageview;
