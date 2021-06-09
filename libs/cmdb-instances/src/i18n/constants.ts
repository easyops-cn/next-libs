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
  BASIC_INFORMATION = "BASIC_INFORMATION",
  MORE = "MORE",
  DEFAULT_ATTRIBUTE = "DEFAULT_ATTRIBUTE",
  CANCEL = "CANCEL",
  CLOSE = "CLOSE",
  SHOW_SETTINGS = "SHOW_SETTINGS",
  FIELD_SETTINGS = "FIELD_SETTINGS",
  SEARCH_BY_FIELD_NAME = "SEARCH_BY_FIELD_NAME",
  RESTORE_DEFAULT = "RESTORE_DEFAULT",
  CONFIRM = "CONFIRM",
  ONLY_ONE_INSTANCE_TO_ALLOWED = "ONLY_ONE_INSTANCE_TO_ALLOWED",
  OPERATOR_CONTAIN_DEFINE = "OPERATOR_CONTAIN_DEFINE",
  OPERATOR_NOT_CONTAIN_DEFINE = "OPERATOR_NOT_CONTAIN_DEFINE",
  OPERATOR_EQUAL_DEFINE = "OPERATOR_EQUAL_DEFINE",
  OPERATOR_NOT_EQUAL_DEFINE = "OPERATOR_NOT_EQUAL_DEFINE",
  OPERATOR_IS_EMPTY_DEFINE = "OPERATOR_IS_EMPTY_DEFINE",
  OPERATOR_IS_NOT_EMPTY_DEFINE = "OPERATOR_IS_NOT_EMPTY_DEFINE",
  OPERATOR_BETWEEN_DEFINE_TEXT = "OPERATOR_BETWEEN_DEFINE_TEXT",
  OPERATOR_BETWEEN_DEFINE_TEXT_TIME = "OPERATOR_BETWEEN_DEFINE_TEXT_TIME",
  OPERATOR_BETWEEN_DEFINE_TEXT_INT = "OPERATOR_BETWEEN_DEFINE_TEXT_INT",
  OPERATOR_BETWEEN_DEFINE_TEXT_THE = "OPERATOR_BETWEEN_DEFINE_TEXT_THE",
  SEARCH = "SEARCH",
  RESET = "RESET",
  CREATOR = "CREATOR",
  CREATION_TIME = "CREATION_TIME",
  MODIFIER = "MODIFIER",
  LAST_MODIFICATION_TIME = "LAST_MODIFICATION_TIME",
  DEVELOPMENT = "DEVELOPMENT",
  VIEW = "VIEW",
  ITEM_ADD_IN_BATCHES = "ITEM_ADD_IN_BATCHES",
  SAVE = "SAVE",
  MODIFICATION = "MODIFICATION",
  NOT_MEET_REGEX = "NOT_MEET_REGEX",
  CREATE_ANOTHER = "CREATE_ANOTHER",
  DELETE_STRUCT_CONFIRM_MSG = "DELETE_STRUCT_CONFIRM_MSG",
  OPERATION = "OPERATION",
  VIEW_ALL_SELECTED_INSTANCES = "VIEW_ALL_SELECTED_INSTANCES",
  CHOOSE_INSTANCE = "CHOOSE_INSTANCE",
  VIEW_ALL_DATA = "VIEW_ALL_DATA",
  FILTER_FROM_CMDB = "FILTER_FROM_CMDB",
  PAGINATION_TOTAL_TEXT = "PAGINATION_TOTAL_TEXT",
  PAGINATION_TOTAL_UNIT = "PAGINATION_TOTAL_UNIT",
  JUMP_TO = "JUMP_TO",
  INSTANCE_DETAIL = "INSTANCE_DETAIL",
}

export type Locale = { [key in K]: string };
