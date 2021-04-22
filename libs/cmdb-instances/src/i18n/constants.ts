export const NS_LIBS_CMDB_INSTANCES = "libs-cmdb-instances";

export enum K {
  VALIDATE_MESSAGE_REQUIRED = "VALIDATE_MESSAGE_REQUIRED",
  DYNAMIC_FILTER = "DYNAMIC_FILTER",
  TIP = "TIP",
  DELETE = "DELETE",
  INVALID_OR_FORBIDDEN_IPS = "INVALID_OR_FORBIDDEN_IPS",
  INVALID = "INVALID",
  SELECT_FROM_CMDB = "SELECT_FROM_CMDB",
  IP_PLACEHOLDER = "IP_PLACEHOLDER",
  CLICK_TO_SELECT = "CLICK_TO_SELECT",
  MATCHING_REGULAR = "MATCHING_REGULAR",
  ADD = "ADD",
  ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR = "ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR",
  UNIQUE_NO_REPEAT = "UNIQUE_NO_REPEAT",
  TYPE_NO_SUPPORT_EDIT = "TYPE_NO_SUPPORT_EDIT",
  TEMPORARILY_NOT_CHOOSE = "TEMPORARILY_NOT_CHOOSE",
  ENUM_ERROR_TIP = "ENUM_ERROR_TIP",
  STRUCT_ERROR_TIP = "STRUCT_ERROR_TIP",
  LINK = "LINK",
  LINK_PLACEHOLDER = "LINK_PLACEHOLDER",
  TITLE = "TITLE",
  TITLE_PLACEHOLDER = "TITLE_PLACEHOLDER",
  CLICK_TO_FILTER = "CLICK_TO_FILTER",
  CLICK_TO_CANCEL_FILTER = "CLICK_TO_CANCEL_FILTER",
  CLICK_TO_HIDDEN = " CLICK_TO_HIDDEN",
  CLICK_TO_SHOW = " CLICK_TO_SHOW",
  RELATED_TO_ME = "RELATED_TO_ME",
  DISPLAY_OMITTED_INFORMATION = "DISPLAY_OMITTED_INFORMATION",
  CLEAR = "CLEAR",
  NORMAL_HOST = "NORMAL_HOST",
  CURRENT_FILTER_REQUIREMENTS = "CURRENT_FILTER_REQUIREMENTS",
  ADVANCED_SEARCH = "ADVANCED_SEARCH",
  CHOSEN_OPTIONS = "CHOSEN_OPTIONS",
  FUZZY_SEARCH = "FUZZY_SEARCH",
}

export type Locale = { [key in K]: string };
