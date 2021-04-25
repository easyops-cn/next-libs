import i18next from "i18next";
import { NS_LIBS_CMDB_UTILS } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

export function addResourceBundle(): void {
  i18next.addResourceBundle("en", NS_LIBS_CMDB_UTILS, en);
  i18next.addResourceBundle("zh", NS_LIBS_CMDB_UTILS, zh);
}
