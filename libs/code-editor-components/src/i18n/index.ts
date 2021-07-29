import i18next from "i18next";
import { NS_CODE_EDITOR_COMPONENTS } from "./constants";
import en from "./locales/en";
import zh from "./locales/zh";

i18next.addResourceBundle("en", NS_CODE_EDITOR_COMPONENTS, en);
i18next.addResourceBundle("zh", NS_CODE_EDITOR_COMPONENTS, zh);
