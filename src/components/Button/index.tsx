/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import Link from "../Link";
import { Box, PolymorphicComponentProps } from "../PolymorphicBox";
import { styleProps } from "./styles";
import LoadingIndicator from "components/LoadingIndicator";
import { Text } from "components/Text";

export type ButtonVariant = "filled" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";
type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  disabled?: boolean;
  className?: string;
  iconLeft?: React.ComponentType;
  iconRight?: React.ComponentType;
  loading?: boolean;
  loadingText?: string;
};
type ButtonProps<E extends React.ElementType> = PolymorphicComponentProps<
  E,
  ButtonOwnProps
>;

const defaultComponent = BaseButton;

/**
 * renders anything with button styles from the theme. Pass an
 * "as" prop to control the backing component
 */
function Button<E extends React.ElementType = typeof defaultComponent>({
  variant = "filled",
  color = "brand.primary",
  size = "md",
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  loading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps<E>): JSX.Element {
  return (
    <Box
      component={defaultComponent}
      sx={styleProps(color, size, variant)}
      disabled={loading || disabled}
      {...props}
    >
      {!loading && IconLeft && <IconLeft sx={{ mr: 1, ml: -1 }} />}
      {!loading && children}
      {!loading && IconRight && <IconRight sx={{ mr: -1, ml: 1 }} />}
      {loading && (
        <LoadingIndicator
          color="ui.gray.extraDark"
          size={18}
          sx={{
            ml: loadingText ? -2 : undefined,
            mr: loadingText ? 2 : undefined
          }}
        />
      )}
      {loading && loadingText && <Text>{loadingText}</Text>}
    </Box>
  );
}

/**
 * The nav button renders a Link, which already takes an "as" prop, so
 * we need to pass that through the PolymorphicBox via some other name
 */
type NavButtonProps = React.ComponentProps<typeof Link> & ButtonOwnProps;
export function NavButton(props: NavButtonProps) {
  return <Button component={Link} {...props} />;
}

function isNavButton(props: AmbiguousButtonProps): props is NavButtonProps {
  return "collectionUrl" in props || "bookUrl" in props || "href" in props;
}

type AmbiguousButtonProps =
  | NavButtonProps
  | ButtonProps<typeof defaultComponent>;
export function AmbiguousButton(props: AmbiguousButtonProps) {
  if (isNavButton(props)) return <NavButton {...props} />;
  return <Button {...props} />;
}

type AnchorButtonProps = Omit<React.ComponentProps<"a">, "ref"> &
  ButtonOwnProps & { newTab?: boolean };
export function AnchorButton(props: AnchorButtonProps) {
  return (
    <Button
      rel={props.newTab ? "noreferrer noopener" : undefined}
      target={props.newTab ? "__blank" : undefined}
      component="a"
      {...props}
    />
  );
}
export default Button;
