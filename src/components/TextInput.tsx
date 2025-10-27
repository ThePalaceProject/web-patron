// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as React from "react";

/**
 * A base component that can be easily customized within
 * the CPW design system
 */

const styles = {
  borderRadius: 1,
  border: "solid",
  px: 2,
  py: 1,
  fontSize: "0",
  variant: "text.body.regular",
  width: "100%",
  "&::placeholder": {
    fontStyle: "italic",
    color: "ui.gray.dark",
    fontSize: "-1"
  }
};

const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ type = "text", ...props }, ref) => {
  return <input ref={ref} type={type} sx={styles} {...props} />;
});
TextInput.displayName = "TextInput";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.InputHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  return <textarea ref={ref} sx={styles} {...props} />;
});
TextArea.displayName = "TextArea";

export default TextInput;
