import type * as React from "react";
import variants from "theme/variants";

/**
 * Hides an element visually while keeping it for screen readers. For
 * elements outside a ThemeUIProvider, where the `accessibility.visuallyHidden`
 * variant cannot be used by name.
 */
export const VISUALLY_HIDDEN_STYLE = variants.accessibility
  .visuallyHidden as React.CSSProperties;
