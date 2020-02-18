import theme from "./theme";
import { SystemStyleObject } from "@styled-system/css";

export type Overloadable<T, K> = T & {
  [overload: string]: K;
};

export type ButtonVariants = {
  primary: SystemStyleObject;
  flat: SystemStyleObject;
  accent: SystemStyleObject;
};

export type TextVariants = {};

export type CardVariants = {
  bookDetails: SystemStyleObject;
};

export type Theme = typeof theme;

export default theme;
