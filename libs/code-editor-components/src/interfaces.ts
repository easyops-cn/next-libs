import { Annotation } from "brace";
import { FormItemWrapperProps } from "@next-libs/forms";
import { IMarker } from "react-ace";

export interface Error {
  err: Annotation[];
  hasError: boolean;
}

export interface ExtendedMarker extends IMarker {
  highlightType: HighlightTokenType;
  identifier: string;
}

export interface CodeEditorProps extends FormItemWrapperProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onErrorChange?: (error: Error) => void;
  disabled?: boolean;
  theme?: string;
  mode: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  maxLines?: number | "Infinity";
  minLines?: number;
  tabSize?: number;
  printMargin?: boolean;
  highlightActiveLine?: boolean;
  onValidate?: (error: Annotation[]) => void;
  showExportButton?: boolean;
  showCopyButton?: boolean;
  showExpandButton?: boolean;
  exportFileName?: string;
  jsonSchema?: Record<string, any>;
  validateJsonSchemaMode?: "warning" | "error";
  schemaRef?: string;
  enableLiveAutocompletion?: boolean;
  customCompleters?:
    | string[]
    | {
        caption?: string;
        value: string;
        meta?: string;
        score?: number;
      }[];
  loadYamlInJsonMode?: boolean;
  showPrintMargin?: boolean;
  highlightTokens?: HighlightTokenSettings[];
  onClickHighlightToken?: (token: {
    type: HighlightTokenType;
    value: string;
  }) => void;
}

export interface HighlightTokenSettings {
  type: HighlightTokenType;
  clickable?: boolean;
}

export type HighlightTokenType = "storyboard-function" | "storyboard-context";

export interface AceLanguageRules {
  [className: string]: AceLanguageRule[];
}

export interface AceLanguageRule {
  token?: string | string[] | AceTokenFunction;
  regex?: string | RegExp;
  next?: string;
  defaultToken?: string;
  consumeLineEnd?: boolean;
  onMatch?: (
    val?: string,
    state?: unknown,
    stack?: [string, number],
    line?: string
  ) => string;
}

export type AceTokenFunction = (value: string) => string;
