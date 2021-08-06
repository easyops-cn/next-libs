import { brickNextEntryRules, generateBrickNextRules } from "./BrickNextRules";
import ace from "brace";
import { loadPluginsForCodeEditor } from "../brace";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export function getBrickNextMode() {
  loadPluginsForCodeEditor();

  const JavaScriptHighlightRules = ace.acequire(
    "ace/mode/javascript_highlight_rules"
  ).JavaScriptHighlightRules;

  // Ref https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode
  // istanbul ignore next
  class CustomHighlightRules extends ace.acequire(
    "ace/mode/json_highlight_rules"
  ).JsonHighlightRules {
    constructor() {
      super();
      let originalRules = this.$rules;
      originalRules.string.unshift(...brickNextEntryRules("Double"));
      originalRules = {
        ...originalRules,
        ...generateBrickNextRules("Double"),
      };
      this.$rules = { ...originalRules };
      this.embedRules(JavaScriptHighlightRules, "brickNextDouble-jscode-", [
        {
          include: ["brickNextDouble-placeholder"],
        },
      ]);
      this.normalizeRules();
    }
  }

  return class BrickNextMode extends ace.acequire("ace/mode/json").Mode {
    constructor() {
      super();
      this.HighlightRules = CustomHighlightRules;
    }
  };
}
