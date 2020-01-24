/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import { ButtonVariants, VariantProp } from "../interfaces";
import Link from "./Link";

type ButtonProps = {
  variant?: VariantProp<ButtonVariants>;
} & React.ComponentProps<typeof BaseButton>;

const buttonStyles = variant => ({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  textAlign: "center",
  lineHeight: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "bold",
  m: 0,
  px: 3,
  py: 1,
  border: 0,
  borderRadius: 2,
  cursor: "pointer",
  variant: `buttons.${variant}`
});

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  disabled,
  ...props
}) => {
  return (
    <BaseButton {...props} disabled={disabled} sx={buttonStyles(variant)} />
  );
};

type LinkButtonProps = ButtonProps & React.ComponentProps<typeof Link>;

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ to, children, variant = "primary", ...props }, ref) => {
    return (
      <Link ref={ref} to={to} sx={buttonStyles(variant)} {...props}>
        {children}
      </Link>
    );
  }
);

export default Button;
