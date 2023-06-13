import { Locale, K } from "../constants";

const locale: Locale = {
  [K.VALIDATE_MESSAGE_REQUIRED]: "%s is required",
  [K.DYNAMIC_FILTER]: "Dynamic Filter",
  [K.TIP]: "Tip",
  [K.DELETE]: "Delete",
  [K.INVALID_OR_FORBIDDEN_IPS]: "Invalid or forbidden IPs：",
  [K.INVALID]: "Invalid ",
  [K.SELECT_FROM_CMDB]: "Select from CMDB",
  [K.IP_PLACEHOLDER]: "For example: 192.168.100.1",
  [K.CLICK_TO_SELECT]: "Click to select",
  [K.MATCHING_REGULAR]: "Matching regular {{regexp}}",
  [K.ADD]: "Add",
  [K.ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR]:
    "Enter multiple string with enter key as the separator",
  [K.UNIQUE_NO_REPEAT]: "{{label}} is unique and cannot be repeated",
  [K.TYPE_NO_SUPPORT_EDIT]: "{{type}} does not support editing for now",
  [K.TEMPORARILY_NOT_CHOOSE]: "Temporarily not choose",
  [K.ENUM_ERROR_TIP]:
    "Please add an enumeration value in resource model management, attribute:{{attribute}}",
  [K.STRUCT_ERROR_TIP]:
    "Please add an structure value in resource model management, attribute:{{attribute}}",
  [K.LINK]: "Link:",
  [K.LINK_PLACEHOLDER]: "Please enter the link",
  [K.TITLE]: "Title:",
  [K.TITLE_PLACEHOLDER]: "Optional, please enter the title",
  [K.CLICK_TO_FILTER]: `Click to filter "{{label}}"`,
  [K.CLICK_TO_CANCEL_FILTER]: `Click Cancel to filter "{{label}}"`,
  [K.CLICK_TO_HIDDEN]: `Click to hide "{{label}}"`,
  [K.CLICK_TO_SHOW]: `Click to show "{{label}}"`,
  [K.RELATED_TO_ME]: "Related to me",
  [K.DISPLAY_OMITTED_INFORMATION]: "Omitted information",
  [K.CLEAR]: "Clear",
  [K.NORMAL_HOST]: "Normal host",
  [K.CURRENT_FILTER_REQUIREMENTS]: "Current filter requirements:",
  [K.ADVANCED_SEARCH]: "Advanced search",
  [K.CHOSEN_OPTIONS]: "Chosen {{count}} options",
  [K.FUZZY_SEARCH]: "Fuzzy search: {{query}}",
  [K.BASIC_INFORMATION]: "Basic information",
  [K.MORE]: "More",
  [K.DEFAULT_ATTRIBUTE]: "Default attribute",
  [K.CANCEL]: "Cancel",
  [K.CLOSE]: "Close",
  [K.DISPLAY_SETTINGS]: "Display Settings",
  [K.FIELD_SETTINGS]: "Field settings",
  [K.SEARCH_BY_FIELD_NAME]: "Search by field name",
  [K.RESTORE_DEFAULT]: "Restore default",
  [K.CONFIRM]: "Confirm",
  [K.ONLY_ONE_INSTANCE_TO_ALLOWED]:
    "Only one instance is allowed to be selected",
  [K.OPERATOR_CONTAIN_DEFINE]: "Contain",
  [K.OPERATOR_NOT_CONTAIN_DEFINE]: "Not contain",
  [K.OPERATOR_EQUAL_DEFINE]: "Equal",
  [K.OPERATOR_NOT_EQUAL_DEFINE]: "Not equal",
  [K.OPERATOR_IS_EMPTY_DEFINE]: "Empty",
  [K.OPERATOR_IS_NOT_EMPTY_DEFINE]: "Not empty",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT]: "Range",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME]: "During this period",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_INT]: "In this interval",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_THE]: "In between",
  [K.SEARCH]: "Search",
  [K.RESET]: "Reset",
  [K.CREATOR]: "Creator",
  [K.CREATION_TIME]: "Creation time",
  [K.MODIFIER]: "Modifier",
  [K.LAST_MODIFICATION_TIME]: "Last modification time",
  [K.DEVELOPMENT]: "Development",
  [K.VIEW]: "View",
  [K.ITEM_ADD_IN_BATCHES]: "Add {{name}} in batches",
  [K.SAVE]: "Save",
  [K.SAVE_AND_CONTINUE]: "Save and continue adding",
  [K.MODIFICATION]: "Modification",
  [K.NOT_MEET_REGEX]:
    "Does not match the preset regular expression, please modify",
  [K.NOT_MEET_REGEX_DETAIL]:
    "Does not match the preset regular expression: {{regex}} , please modify",
  [K.NOT_MEET_JSON]: "Please fill in the correct json syntax",
  [K.CREATE_ANOTHER]: "Create another",
  [K.DELETE_STRUCT_CONFIRM_MSG]:
    "Are you sure you want to delete this structure item?",
  [K.DELETE_INSTANCE_CONFIRM_MSG]:
    "Are you sure you want to delete the relation?",
  [K.OPERATION]: "Operation",
  [K.VIEW_ALL_SELECTED_INSTANCES]: "View all selected instances",
  [K.CHOOSE_INSTANCE]: "Choose instance",
  [K.VIEW_ALL_DATA]: "View all {{count}} data",
  [K.FILTER_FROM_CMDB]: "Filter {{name}} From CMDB",
  [K.PAGINATION_TOTAL_TEXT]: "total",
  [K.PAGINATION_TOTAL_UNIT]: "items",
  [K.JUMP_TO]: "Jump to ",
  [K.INSTANCE_DETAIL]: "",
  [K.COPY]: "Copy",
  [K.COPY_SUCCESS]: "Copy success",
  [K.FILTER_FROM_CMDB_TYPE]: "Filter {{type}} from CMDB",
  [K.USERS]: "Users",
  [K.USER_GROUPS]: "User groups",
  [K.SWITCH]: "Switch to {{type}}",
  [K.USERS_RESULT_LABEL]:
    "Users (only display the top 20 items, please search for more results)",
  [K.NO_DATA]: "No Data",
  [K.USER_GROUPS_RESULT_LABEL]:
    "User groups (only display the top 20 items, please search for more results)",
  [K.PERMISSION_WHITELIST]: "Permission whitelist",
  [K.ALL_CLUSTER]: "All cluster",
  [K.FREE_SELECTION]: "Free selection",
  [K.APP_SELECTION]: "App selection",
  [K.ATTRIBUTE_NAME_REQUIRED]: "{{attribute_name}} is required",
  [K.INSTANCE_SOURCE]: "Instance source",
  [K.INSTANCE_SOURCE_TOOLTIP]:
    "The instance comes from a common model that inherits the current parent model",
  [K.INSTANCE_SOURCE_TAG_TEXT]: 'Instance source: equal to "{{query}}"',
  [K.COPY_SELECTED_IP]: "Copy selected IP",
  [K.SELECT_COPY_DATA]: "Select the data to be copied",
  [K.ADVANCE_SEARCH_SINGLE_INPUT_PLACEHOLDER]:
    "Please enter keywords, multiple values ​​separated by spaces",
  [K.NUMBER_INPUT_PLACEHOLDER]: "Please enter number",
  [K.FIX_HEADER]: "Fix the header",
  [K.CANCEL_FIX_HEADER]: "Cancel fix the header",
  [K.VIEW_SPECIFIC_INSTANCES]: "View specific instances",
  [K.VIEW_MORE]: "View more",
  [K.CREATE_AND_BIND]: "Create and bind",
};

export default locale;
