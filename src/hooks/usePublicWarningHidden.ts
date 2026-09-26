import * as React from "react";
import {
  isPublicWarningHidden,
  subscribeToPublicWarning
} from "utils/publicWarning";

/**
 * Whether the user opted out of the public computer warning, kept current
 * across tabs. False during server rendering and hydration.
 */
export default function usePublicWarningHidden(): boolean {
  return React.useSyncExternalStore(
    subscribeToPublicWarning,
    isPublicWarningHidden,
    () => false
  );
}
