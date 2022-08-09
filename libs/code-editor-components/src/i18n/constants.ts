export const NS_CODE_EDITOR_COMPONENTS = "code-editor-components";

export enum K {
  COPY_TOOLTIP = "COPY_TOOLTIP",
  EXPORT_TOOLTIP = "EXPORT_TOOLTIP",
  EXPAND = "EXPAND",
  COLLAPSE = "COLLAPSE",
}

export type Locale = { [key in K]: string };
