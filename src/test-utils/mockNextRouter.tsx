// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { jest } from "@jest/globals";
import * as React from "react";
import Router from "next/router";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { NextRouter } from "next/router";
import { libraryData } from "test-utils/fixtures";

/**
 * Mock for the next/Router import.
 */

export const mockPush = jest.fn().mockImplementation(async () => true);
Router.push = mockPush;

export const MockNextRouterContextProvider: React.FC<{
  router?: Partial<NextRouter>;
}> = ({ router = {}, children }) => {
  const {
    isReady = true,
    basePath = "",
    route = "",
    pathname = "",
    query = {
      // add the default library slug to the default query params
      library: libraryData.slug
    },
    // default as path is the home page
    asPath = `/${libraryData.slug}`,
    push = mockPush,
    replace = jest.fn().mockImplementation(async () => true),
    reload = jest.fn().mockImplementation(() => null),
    back = jest.fn().mockImplementation(() => null),
    prefetch = jest.fn().mockImplementation(async () => undefined),
    beforePopState = jest.fn().mockImplementation(() => null),
    isFallback = false,
    isLocaleDomain = false,
    isPreview = false,
    events = {
      on: () => null,
      off: () => null,
      emit: () => null
    }
  } = router;
  return (
    <RouterContext.Provider
      value={{
        isReady,
        basePath,
        route,
        pathname,
        query,
        asPath,
        push,
        replace,
        reload,
        back,
        prefetch,
        beforePopState,
        isFallback,
        isLocaleDomain,
        isPreview,
        events
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
