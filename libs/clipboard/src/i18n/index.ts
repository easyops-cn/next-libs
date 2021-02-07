import i18next from "i18next";
import { NS_CLIPBOARD } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

export function addResourceBundle() {
  i18next.addResourceBundle("en", NS_CLIPBOARD, en);
  i18next.addResourceBundle("zh", NS_CLIPBOARD, zh);
}

addResourceBundle();
