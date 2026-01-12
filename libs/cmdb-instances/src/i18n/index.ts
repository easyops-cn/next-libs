import i18next from "i18next";
import { NS_LIBS_CMDB_INSTANCES } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

export function initI18n() {
  i18next.addResourceBundle("en", NS_LIBS_CMDB_INSTANCES, en);
  i18next.addResourceBundle("zh", NS_LIBS_CMDB_INSTANCES, zh);
}
