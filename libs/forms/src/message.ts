import i18n from "i18next";
import { K, NS_LIBS_FORM } from "./i18n/constants";
import { FormItemWrapperProps } from "./FormItemWrapper";
import { addResourceBundle } from "./i18n";
addResourceBundle();
export function getDefaultMessage(
  attr: string,
  props: FormItemWrapperProps
): string {
  const { label } = props;
  const value = props[attr as keyof FormItemWrapperProps];

  const message: Record<string, string> = {
    required: i18n.t(`${NS_LIBS_FORM}:${K.REQUIRED_MSG}`, { label }),
    min: i18n.t(`${NS_LIBS_FORM}:${K.MIN_MSG}`, {
      label,
      count: value as number,
    }),
    max: i18n.t(`${NS_LIBS_FORM}:${K.MAX_MSG}`, {
      label,
      count: value as number,
    }),
    pattern: i18n.t(`${NS_LIBS_FORM}:${K.PATTERN}`, { label, pattern: value }),
  };
  return message[attr];
}
