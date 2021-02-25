export const NS_LIBS_FORM = "libs-form";

export enum K {
  REQUIRED_MSG = "REQUIRED_MSG",
  MIN_MSG = "MIN_MSG",
  MAX_MSG = "MAX_MSG",
  PATTERN = "PATTERN_MSG",
  SELECT_ICON = "SELECT_ICON",
  SET_COLOR = "SET_COLOR",
  ICON = "ICON",
  BACKGROUND_SEARCH = "BACKGROUND_SEARCH",
}

export type Locale = { [key in K]: string };
