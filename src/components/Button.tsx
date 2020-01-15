/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import { ButtonVariants, VariantProp } from "../interfaces";

type ButtonProps = {
  variant?: VariantProp<ButtonVariants>;
} & React.ComponentProps<typeof BaseButton>;

const Button: React.FC<ButtonProps> = ({ variant = "primary", ...props }) => {
  return (
    <BaseButton
      {...props}
      sx={{
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
      }}
    />
  );
};

export default Button;
