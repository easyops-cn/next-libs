export const NS_CLIPBOARD = "clipboard";

export enum K {
  COPY_SUCCESS = "COPY_SUCCESS",
  COPY_FAILED = "COPY_FAILED",
}

export type Locale = { [key in K]: string };
