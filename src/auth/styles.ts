import { SxProp } from "theme-ui";

// Auto horizontal margins center the form in the login card. The explicit width
// is required because an item with auto margins does not stretch to fill.
export const authFormStyles: SxProp["sx"] = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 400,
  mx: "auto"
};
