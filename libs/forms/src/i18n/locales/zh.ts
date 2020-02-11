import { Locale, K } from "../constants";

const locale: Locale = {
  [K.REQUIRED_MSG]: "{{label}}为必填项",
  [K.MIN_MSG]: "{{label}}至少包含 {{count}} 个字符",
  [K.MAX_MSG]: "{{label}}不能超过 {{count}} 个字符",
  [K.PATTERN]: "{{label}}没有匹配正则 {{pattern}}"
};

export default locale;
