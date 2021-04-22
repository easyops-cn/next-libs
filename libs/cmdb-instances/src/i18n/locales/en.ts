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
  [K.UNIQUE_NO_REPEAT]: "{{label}} can only be repeated",
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
};

export default locale;
