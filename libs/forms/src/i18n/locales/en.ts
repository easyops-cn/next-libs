import { Locale, K } from "../constants";

const locale: Locale = {
  [K.REQUIRED_MSG]: "{{label}} is required",
  [K.MIN_MSG]: "{{label}} must be at least {{count}} characters",
  [K.MAX_MSG]: "{{label}} cannot be longer than {{count}} characters",
  [K.PATTERN]: "{{label}} does not match pattern {{pattern}}"
};

export default locale;
