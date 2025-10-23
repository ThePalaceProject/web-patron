/** @jsxRuntime classic */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { jsx } from "theme-ui";
import * as React from "react";

type NativeComponent<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
  P = Record<string, unknown>
> = React.FC<React.ComponentProps<T> & P>;

type H1Variant = "text.headers.primary" | "text.headers.secondary";

interface H1Props {
  variant?: H1Variant;
}

export const H1: NativeComponent<"h1", H1Props> = ({
  children,
  variant = "text.headers.primary",
  ...rest
}) => {
  return (
    <h1 sx={{ variant }} {...rest}>
      {children}
    </h1>
  );
};

type H2Variant = "text.headers.secondary" | "text.headers.tertiary";

interface H2Props {
  variant?: H2Variant;
}

export const H2: NativeComponent<"h2", H2Props> = ({
  children,
  variant = "text.headers.secondary",
  ...rest
}) => {
  return (
    <h2 sx={{ variant }} {...rest}>
      {children}
    </h2>
  );
};

export const H3: NativeComponent<"h3"> = ({ children, ...rest }) => {
  return (
    <h3 sx={{ variant: "text.headers.tertiary" }} {...rest}>
      {children}
    </h3>
  );
};

export const Text: NativeComponent<
  "span",
  { variant?: string; className?: string }
> = ({ variant = "text.body.regular", children, ...rest }) => (
  <span sx={{ variant }} {...rest}>
    {children}
  </span>
);

export const P: NativeComponent<"p", { variant?: string }> = ({
  variant = "text.body.regular",
  children,
  ...rest
}) => (
  <p sx={{ variant }} {...rest}>
    {children}
  </p>
);

export const ScreenReaderOnly: NativeComponent<"span"> = ({ children }) => (
  <span sx={{ variant: "text.accessibility.visuallyHidden" }}>{children}</span>
);
