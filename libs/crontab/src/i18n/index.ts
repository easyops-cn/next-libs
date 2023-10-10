import i18next from "i18next";
import { NS_CRONTAB } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

// istanbul ignore next
export function addResourceBundle(): void {
  i18next.addResourceBundle("en", NS_CRONTAB, en);
  i18next.addResourceBundle("zh", NS_CRONTAB, zh);
}
