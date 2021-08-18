import ace from "brace";
import { loadPluginsForCodeEditor } from "../brace";
import { getCommonExpressionLanguageRules } from "./CommonExpressionLanguageRules";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export function getCommonExpressionLanguageMode() {
  loadPluginsForCodeEditor();

  // istanbul ignore next
  class CommonExpressionLanguageHighlightRules extends ace.acequire(
    "ace/mode/text_highlight_rules"
  ).TextHighlightRules {
    constructor() {
      super();
      this.$rules = getCommonExpressionLanguageRules();
      this.normalizeRules();
    }
  }

  return class CommonExpressionLanguageMode extends ace.acequire(
    "ace/mode/text"
  ).Mode {
    constructor() {
      super();
      this.HighlightRules = CommonExpressionLanguageHighlightRules;
    }
  };
}
