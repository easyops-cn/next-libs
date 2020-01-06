import i18next from "i18next";
import { NS_CMDB_INSTANCES } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

export function addResourceBundle(): void {
  i18next.addResourceBundle("en", NS_CMDB_INSTANCES, en);
  i18next.addResourceBundle("zh", NS_CMDB_INSTANCES, zh);
}
