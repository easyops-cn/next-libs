export const NS_LIBS_FORM = "libs-form";

export enum K {
  REQUIRED_MSG = "REQUIRED_MSG",
  MIN_MSG = "MIN_MSG",
  MAX_MSG = "MAX_MSG",
  PATTERN = "PATTERN_MSG"
}

export type Locale = { [key in K]: string };
