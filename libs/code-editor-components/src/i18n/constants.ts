export const NS_CODE_EDITOR_COMPONENTS = "code-editor-components";

export enum K {
  COPY_TOOLTIP = "COPY_TOOLTIP",
  EXPORT_TOOLTIP = "EXPORT_TOOLTIP",
  EXPAND = "EXPAND",
  COLLAPSE = "COLLAPSE",
  COPY_SUCCESS = "COPY_SUCCESS",
  COPY_ERROR = "COPY_ERROR",
}

export type Locale = { [key in K]: string };
