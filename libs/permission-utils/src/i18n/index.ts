import i18next from "i18next";
import { NS_LIBS_PERMISSION } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

// istanbul ignore next
export function addResourceBundle(): void {
  i18next.addResourceBundle("en", NS_LIBS_PERMISSION, en);
  i18next.addResourceBundle("zh", NS_LIBS_PERMISSION, zh);
}
