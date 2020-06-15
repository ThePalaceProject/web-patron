/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import Link from "../Link";
import { Box, PolymorphicComponentProps } from "../PolymorphicBox";
import { styleProps } from "./styles";

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
  ...props
}: ButtonProps<E>): JSX.Element {
  return (
    <Box
      component={defaultComponent}
      sx={styleProps(color, size, variant)}
      {...props}
    >
      {IconLeft && <IconLeft sx={{ mr: 1, ml: -1 }} />}
      {children}
      {IconRight && <IconRight sx={{ mr: -1, ml: 1 }} />}
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
