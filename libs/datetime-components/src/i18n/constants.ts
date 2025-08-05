export const NS_LIBS_DATETIME_COMPONENTS = "libs-datetime-components";

export enum K {
  LAST_AN_HOUR = "LAST_AN_HOUR",
  LAST_24_HOURS = "LAST_24_HOURS",
  TODAY = "TODAY",
  LAST_7_DAYS = "LAST_7_DAYS",
  LAST_30_DAYS = "LAST_30_DAYS",
  CONFIRM = "CONFIRM",
  SPECIFIED_RANGE = "SPECIFIED_RANGE",
  QUICK_SELECTION = "QUICK_SELECTION",
  START_DATE = "START_DATE",
  END_DATE = "END_DATE",
}

export type Locale = { [key in K]: string };
