import { Locale, K } from "../constants";

const locale: Locale = {
  [K.REQUIRED_MSG]: "{{label}}为必填项",
  [K.MIN_MSG]: "{{label}}至少包含 {{count}} 个字符",
  [K.MAX_MSG]: "{{label}}不能超过 {{count}} 个字符",
  [K.PATTERN]: "{{label}}没有匹配正则 {{pattern}}",
  [K.SELECT_ICON]: "选择图标",
  [K.SET_COLOR]: "颜色",
  [K.ICON]: "图标",
  [K.BACKGROUND_SEARCH]: "输入关键字搜索",
};

export default locale;
