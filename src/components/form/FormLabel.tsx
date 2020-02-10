// /** @jsx jsx */
// import { jsx } from "theme-ui";
// import * as React from "react";

// type HTMLLabelProps = React.HTMLProps<HTMLLabelElement>;
// type FormLabelProps = HTMLLabelProps & {
//   required?: boolean;
//   error?: boolean;
//   id: NonNullable<HTMLLabelProps["id"]>;
//   for: string;
// };
// /**
//  * A simple form label with styling and
//  * can have errors as well.
//  */
// const FormLabel: React.FC<FormLabelProps> = ({
//   required = false,
//   error = false,
//   children,
//   id,
//   //eslint-disable-next-line
//   // for,
//   ...rest
// }) => {
//   return <label id={id}>{children}</label>;
// };
