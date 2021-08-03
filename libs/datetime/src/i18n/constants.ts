export const NS_LIBS_DATETIME = "libs-datetime";

export enum K {
  TODAY = "TODAY",
  YESTERDAY = "YESTERDAY",
  FUTURE_AFTER = "FUTURE_AFTER",
  FORMAT_SHORT = "FORMAT_SHORT",
  FORMAT_SHORT_DAY = "FORMAT_SHORT_DAY",
  SECONDS = "SECONDS",
  MILL_SECONDS = "MILL_SECONDS",
  MINUTES = "MINUTES",
  HOURS = "HOURS",
  DAYS = "DARS",
  MONTHS = "MONTHS",
}

export type Locale = { [key in K]: string };
