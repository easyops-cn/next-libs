import i18next from "i18next";
import { NS_LIBS_CMDB_INSTANCES } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

i18next.init({
  //强制所有英语变体都只加载 'en'
  load: "languageOnly",
});
i18next.addResourceBundle("en", NS_LIBS_CMDB_INSTANCES, en);
i18next.addResourceBundle("zh", NS_LIBS_CMDB_INSTANCES, zh);
