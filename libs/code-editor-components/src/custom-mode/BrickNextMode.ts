import { brickNextEntryRules, generateBrickNextRules } from "./BrickNextRules";
import ace from "brace";

const JavaScriptHighlightRules = ace.acequire(
  "ace/mode/javascript_highlight_rules"
).JavaScriptHighlightRules;

// Ref https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode
// istanbul ignore next
export class CustomHighlightRules extends ace.acequire(
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

export class BrickNextMode extends ace.acequire("ace/mode/json").Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
