// SPL (Splunk Processing Language) Mode
// Provides syntax highlighting for Splunk Search Processing Language
import ace from "brace";
import { loadPluginsForCodeEditor } from "../brace";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export function getSplMode() {
  loadPluginsForCodeEditor();

  const CstyleBehaviour = ace.acequire(
    "ace/mode/behaviour/cstyle"
  ).CstyleBehaviour;

  const MatchingBraceOutdent = ace.acequire(
    "ace/mode/matching_brace_outdent"
  ).MatchingBraceOutdent;

  // Ref https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode
  // istanbul ignore next
  class SplHighlightRules extends ace.acequire("ace/mode/text_highlight_rules")
    .TextHighlightRules {
    constructor() {
      super();
      this.$rules = {
        start: [
          // Comments (using backticks in SPL)
          {
            token: "comment.spl",
            regex: "`.*?`",
          },
          // Pipe symbol (command separator)
          {
            token: "keyword.operator.pipe.spl",
            regex: "\\|",
          },
          // SPL Commands (streaming, generating, transforming)
          {
            token: "keyword.command.spl",
            regex:
              "\\b(search|where|eval|stats|chart|timechart|table|fields|rename|sort|dedup|head|tail|top|rare|transaction|streamstats|eventstats|bin|rex|regex|replace|makemv|mvexpand|append|appendcols|join|lookup|inputlookup|outputlookup|return|map|spath|xmlkv|extract|kvform|multikv|format|bucket|predict|correlate|associate|contingency|diff|set|union|intersect|selfjoin|addinfo|addtotals|accum|delta|autoregress|streamstats|trendline|fillnull|filldown|makecontinuous|anomalies|cluster|kmeans|outlier|analyzefields|typer|anomalydetection|mvcombine|nomv|untable|xyseries|sistats|mstats|tstats|pivot|datamodel|typelearner|typeahead|collect|sichart|sitimechart|sitop)\\b",
          },
          // SPL Statistical Functions
          {
            token: "support.function.stats.spl",
            regex:
              "\\b(avg|count|distinct_count|dc|sum|max|min|median|mode|stdev|stdevp|var|varp|sumsq|first|last|list|values|earliest|latest|earliest_time|latest_time|rate|per_second|per_minute|per_hour|per_day|upperperc|lowerperc|percentile|range|exactperc)\\b",
          },
          // SPL Eval Functions - String Functions
          {
            token: "support.function.eval.spl",
            regex:
              "\\b(substr|len|lower|upper|ltrim|rtrim|trim|replace|split|spath|urldecode|printf|coalesce|case|if|validate|like|match|searchmatch|cidrmatch|mvcount|mvindex|mvfilter|mvjoin|mvappend|mvdedup|mvsort|mvzip|mvfind|mvmap|mvrange|commands|tostring|tonumber|null|isnull|isnotnull|isnum|isstr|isbool|isint|typeof)\\b",
          },
          // SPL Eval Functions - Math Functions
          {
            token: "support.function.math.spl",
            regex:
              "\\b(abs|ceiling|ceil|floor|round|exp|ln|log|pow|sqrt|exact|pi|random|now|time|relative_time|strftime|strptime)\\b",
          },
          // SPL Eval Functions - Conversion Functions
          {
            token: "support.function.conversion.spl",
            regex:
              "\\b(tonumber|tostring|acos|acosh|asin|asinh|atan|atan2|atanh|cos|cosh|hypot|sin|sinh|tan|tanh)\\b",
          },
          // Built-in fields
          {
            token: "variable.language.spl",
            regex:
              "\\b(_time|_raw|_indextime|host|source|sourcetype|index|linecount|splunk_server|timestamp|date_hour|date_mday|date_minute|date_month|date_second|date_wday|date_year|date_zone|tag|eventtype|punct|timestartpos|timeendpos)\\b",
          },
          // Comparison operators
          {
            token: "keyword.operator.comparison.spl",
            regex: "\\b(AND|OR|NOT|XOR)\\b|!=|==|<=|>=|<|>",
          },
          // Boolean literals
          {
            token: "constant.language.boolean.spl",
            regex: "\\b(true|false|t|f|TRUE|FALSE|T|F)\\b",
          },
          // Numeric literals
          {
            token: "constant.numeric.spl",
            regex: "\\b\\d+(\\.\\d+)?([eE][+-]?\\d+)?\\b",
          },
          // String literals (double quotes)
          {
            token: "string.quoted.double.spl",
            regex: '"',
            push: [
              {
                token: "string.quoted.double.spl",
                regex: '"',
                next: "pop",
              },
              {
                token: "constant.character.escape.spl",
                regex: "\\\\.",
              },
              {
                defaultToken: "string.quoted.double.spl",
              },
            ],
          },
          // String literals (single quotes)
          {
            token: "string.quoted.single.spl",
            regex: "'",
            push: [
              {
                token: "string.quoted.single.spl",
                regex: "'",
                next: "pop",
              },
              {
                token: "constant.character.escape.spl",
                regex: "\\\\.",
              },
              {
                defaultToken: "string.quoted.single.spl",
              },
            ],
          },
          // Field names
          {
            token: "variable.other.spl",
            regex: "\\b[a-zA-Z_][a-zA-Z0-9_\\.]*\\b",
          },
          // Wildcard
          {
            token: "keyword.operator.wildcard.spl",
            regex: "\\*",
          },
          // Arithmetic operators
          {
            token: "keyword.operator.arithmetic.spl",
            regex: "[+\\-*/%]",
          },
          // Assignment operator
          {
            token: "keyword.operator.assignment.spl",
            regex: "=",
          },
          // Parentheses and brackets
          {
            token: "paren.lparen",
            regex: "[\\[({]",
          },
          {
            token: "paren.rparen",
            regex: "[\\])}]",
          },
          // Comma
          {
            token: "punctuation.separator.spl",
            regex: ",",
          },
          // Whitespace
          {
            token: "text",
            regex: "\\s+",
          },
        ],
      };
      this.normalizeRules();
    }
  }

  return class SplMode extends ace.acequire("ace/mode/text").Mode {
    constructor() {
      super();
      this.HighlightRules = SplHighlightRules;
      this.$outdent = new MatchingBraceOutdent();
      this.$behaviour = new CstyleBehaviour();
    }
  };
}
