import i18next from "i18next";
import { NS_CODE_DISPLAY_COMPONENTS } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

export function addResourceBundle(): void {
  i18next.addResourceBundle("en", NS_CODE_DISPLAY_COMPONENTS, en);
  i18next.addResourceBundle("zh", NS_CODE_DISPLAY_COMPONENTS, zh);
}
