/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import { ButtonVariants, VariantProp } from "../interfaces";
import Link from "./Link";
import { Box, PolymorphicComponentProps } from "./PolymorphicBox";

type Variant = VariantProp<ButtonVariants>;
type ButtonOwnProps = { variant?: Variant; disabled?: boolean };
type ButtonProps<E extends React.ElementType> = PolymorphicComponentProps<
  E,
  ButtonOwnProps
>;

const defaultComponent = BaseButton;

function Button<E extends React.ElementType = typeof defaultComponent>({
  variant = "primary",
  ...props
}: ButtonProps<E>): JSX.Element {
  return (
    <Box
      as={defaultComponent}
      sx={{ variant: `buttons.${variant}` }}
      {...props}
    />
  );
}

type NavButtonProps = React.ComponentProps<typeof Link> & ButtonOwnProps;
export function NavButton(props: NavButtonProps) {
  return <Button as={Link} {...props} />;
}

type AnchorButtonProps = React.ComponentProps<typeof Styled.a> & ButtonOwnProps;
export function AnchorButton(props: AnchorButtonProps) {
  return <Button as="a" {...props} />;
}

// type BaseButtonProps = React.ComponentProps<typeof BaseButton>;
// type ButtonProps = {
//   variant?: Variant;
// } & BaseButtonProps;

const buttonStyles = (variant: VariantProp<ButtonVariants>) => ({
  variant: `buttons.${variant}`
});

/**
 * Visually a button. It can be backed by whatever element you like, though.
 * you can provide one of
 *  - href : will render an achor tag
 *  - to: will render a react-router link
 *  - onClick: will render a reakit button
 *
 * Alternatively, provide your own component, and it will use that
 */
// function Button({
//   variant = "primary",
//   disabled = false,
//   as,
//   ...props
// }: ButtonProps) {
//   return (
//     <BaseButton
//       as={as}
//       {...props}
//       disabled={disabled}
//       sx={buttonStyles(variant)}
//       {...props}
//     />
//   );
// }

// type NavButtonProps = Omit<ButtonProps, keyof BaseButtonProps> &
//   React.ComponentProps<typeof Link>;
// /**
//  * A button that takes a "to" prop for an internal link
//  */
// export const NavButton: React.FC<NavButtonProps> = React.forwardRef(
//   (
//     { children, variant = "primary", ...props }: NavButtonProps,
//     ref: React.Ref<any>
//   ) => {
//     return (
//       <Link ref={ref} sx={buttonStyles(variant)} {...props}>
//         {children}
//       </Link>
//     );
//   }
// );

// type LinkButtonProps = {
//   variant?: Variant;
//   disabled?: boolean;
// } & React.ComponentProps<typeof Styled.a>;

// /**
//  * A button that takes an href prop for an external link
//  */
// export const LinkButton: React.FC<LinkButtonProps> = ({
//   variant = "primary",
//   className,
//   // I had to pull ref off of here to get typescript not to complain
//   // there must be an upstream bug in @types/theme-ui
//   ref,
//   ...props
// }) => {
//   return (
//     <Styled.a sx={buttonStyles(variant)} className={className} {...props} />
//   );
// };
export default Button;
