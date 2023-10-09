export const NS_CRONTAB = "crontab";

export enum K {
  CRONTAB = "CRONTAB",
  OR_MONTHLY = "OR_MONTHLY",
}

export type Locale = { [key in K]: string };
