/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import { ButtonVariants, VariantProp } from "../interfaces";
import Link from "./Link";

type Variant = VariantProp<ButtonVariants>;
type ButtonProps = {
  variant?: Variant;
} & React.ComponentProps<typeof BaseButton>;

const buttonStyles = (variant: VariantProp<ButtonVariants>) => ({
  variant: `buttons.${variant}`
});
/**
 * A button that takes an "onClick" prop like a normal button
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  disabled,
  ...props
}) => {
  return (
    <BaseButton {...props} disabled={disabled} sx={buttonStyles(variant)} />
  );
};

type NavButtonProps = ButtonProps & React.ComponentProps<typeof Link>;
/**
 * A button that takes a "to" prop for an internal link
 */
export const NavButton = React.forwardRef<HTMLAnchorElement, NavButtonProps>(
  ({ to, children, variant = "primary", ...props }, ref) => {
    return (
      <Link ref={ref} to={to} sx={buttonStyles(variant)} {...props}>
        {children}
      </Link>
    );
  }
);

type LinkButtonProps = { variant?: Variant } & React.ComponentProps<
  typeof Styled.a
>;

/**
 * A button that takes an href prop for an external link
 */
export const LinkButton: React.FC<LinkButtonProps> = ({
  variant = "primary",
  className,
  // I had to pull ref off of here to get typescript not to complain
  // there must be an upstream bug in @types/theme-ui
  ref,
  ...props
}) => {
  return (
    <Styled.a sx={buttonStyles(variant)} className={className} {...props} />
  );
};
export default Button;
