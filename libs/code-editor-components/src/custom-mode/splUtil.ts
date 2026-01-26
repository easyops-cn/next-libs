// SPL (Splunk Processing Language) Auto-completion utilities

export interface SplCompleterItem {
  caption: string;
  value: string;
  meta: string;
  score?: number;
}

// SPL Commands Auto-completers
const splCommandsCompleters: SplCompleterItem[] = [
  // Streaming commands
  { caption: "search", value: "search ", meta: "command" },
  { caption: "where", value: "where ", meta: "command" },
  { caption: "eval", value: "eval ", meta: "command" },
  { caption: "fields", value: "fields ", meta: "command" },
  { caption: "rename", value: "rename ", meta: "command" },
  { caption: "rex", value: "rex ", meta: "command" },
  { caption: "regex", value: "regex ", meta: "command" },
  { caption: "dedup", value: "dedup ", meta: "command" },
  { caption: "sort", value: "sort ", meta: "command" },
  { caption: "head", value: "head ", meta: "command" },
  { caption: "tail", value: "tail ", meta: "command" },
  { caption: "replace", value: "replace ", meta: "command" },
  { caption: "fillnull", value: "fillnull ", meta: "command" },
  { caption: "makemv", value: "makemv ", meta: "command" },
  { caption: "mvexpand", value: "mvexpand ", meta: "command" },
  { caption: "streamstats", value: "streamstats ", meta: "command" },
  { caption: "eventstats", value: "eventstats ", meta: "command" },
  { caption: "bin", value: "bin ", meta: "command" },
  { caption: "bucket", value: "bucket ", meta: "command" },
  { caption: "extract", value: "extract ", meta: "command" },
  { caption: "spath", value: "spath ", meta: "command" },

  // Transforming commands
  { caption: "stats", value: "stats ", meta: "command" },
  { caption: "chart", value: "chart ", meta: "command" },
  { caption: "timechart", value: "timechart ", meta: "command" },
  { caption: "table", value: "table ", meta: "command" },
  { caption: "top", value: "top ", meta: "command" },
  { caption: "rare", value: "rare ", meta: "command" },
  { caption: "transaction", value: "transaction ", meta: "command" },

  // Generating commands
  { caption: "inputlookup", value: "inputlookup ", meta: "command" },
  { caption: "makeresults", value: "makeresults ", meta: "command" },
  { caption: "pivot", value: "pivot ", meta: "command" },
  { caption: "datamodel", value: "datamodel ", meta: "command" },

  // Dataset processing commands
  { caption: "append", value: "append ", meta: "command" },
  { caption: "appendcols", value: "appendcols ", meta: "command" },
  { caption: "join", value: "join ", meta: "command" },
  { caption: "lookup", value: "lookup ", meta: "command" },
  { caption: "union", value: "union ", meta: "command" },
  { caption: "set", value: "set ", meta: "command" },

  // Other commands
  { caption: "outputlookup", value: "outputlookup ", meta: "command" },
  { caption: "return", value: "return ", meta: "command" },
  { caption: "map", value: "map ", meta: "command" },
  { caption: "addinfo", value: "addinfo ", meta: "command" },
  { caption: "addtotals", value: "addtotals ", meta: "command" },
  { caption: "filldown", value: "filldown ", meta: "command" },
  { caption: "untable", value: "untable ", meta: "command" },
  { caption: "xyseries", value: "xyseries ", meta: "command" },
];

// SPL Statistical Functions
const splStatsFunctionsCompleters: SplCompleterItem[] = [
  { caption: "count", value: "count()", meta: "stats function" },
  { caption: "dc", value: "dc()", meta: "stats function" },
  {
    caption: "distinct_count",
    value: "distinct_count()",
    meta: "stats function",
  },
  { caption: "sum", value: "sum()", meta: "stats function" },
  { caption: "avg", value: "avg()", meta: "stats function" },
  { caption: "max", value: "max()", meta: "stats function" },
  { caption: "min", value: "min()", meta: "stats function" },
  { caption: "median", value: "median()", meta: "stats function" },
  { caption: "mode", value: "mode()", meta: "stats function" },
  { caption: "stdev", value: "stdev()", meta: "stats function" },
  { caption: "var", value: "var()", meta: "stats function" },
  { caption: "first", value: "first()", meta: "stats function" },
  { caption: "last", value: "last()", meta: "stats function" },
  { caption: "list", value: "list()", meta: "stats function" },
  { caption: "values", value: "values()", meta: "stats function" },
  { caption: "earliest", value: "earliest()", meta: "stats function" },
  { caption: "latest", value: "latest()", meta: "stats function" },
  { caption: "range", value: "range()", meta: "stats function" },
  { caption: "rate", value: "rate()", meta: "stats function" },
  { caption: "per_second", value: "per_second()", meta: "stats function" },
  { caption: "per_minute", value: "per_minute()", meta: "stats function" },
  { caption: "per_hour", value: "per_hour()", meta: "stats function" },
  { caption: "per_day", value: "per_day()", meta: "stats function" },
  { caption: "percentile", value: "percentile()", meta: "stats function" },
];

// SPL Eval Functions
const splEvalFunctionsCompleters: SplCompleterItem[] = [
  // String functions
  { caption: "substr", value: "substr()", meta: "eval function" },
  { caption: "len", value: "len()", meta: "eval function" },
  { caption: "lower", value: "lower()", meta: "eval function" },
  { caption: "upper", value: "upper()", meta: "eval function" },
  { caption: "trim", value: "trim()", meta: "eval function" },
  { caption: "ltrim", value: "ltrim()", meta: "eval function" },
  { caption: "rtrim", value: "rtrim()", meta: "eval function" },
  { caption: "replace", value: "replace()", meta: "eval function" },
  { caption: "split", value: "split()", meta: "eval function" },
  { caption: "urldecode", value: "urldecode()", meta: "eval function" },

  // Conditional functions
  { caption: "if", value: "if()", meta: "eval function" },
  { caption: "case", value: "case()", meta: "eval function" },
  { caption: "coalesce", value: "coalesce()", meta: "eval function" },
  { caption: "like", value: "like()", meta: "eval function" },
  { caption: "match", value: "match()", meta: "eval function" },
  { caption: "searchmatch", value: "searchmatch()", meta: "eval function" },
  { caption: "validate", value: "validate()", meta: "eval function" },

  // Math functions
  { caption: "abs", value: "abs()", meta: "eval function" },
  { caption: "ceil", value: "ceil()", meta: "eval function" },
  { caption: "ceiling", value: "ceiling()", meta: "eval function" },
  { caption: "floor", value: "floor()", meta: "eval function" },
  { caption: "round", value: "round()", meta: "eval function" },
  { caption: "exp", value: "exp()", meta: "eval function" },
  { caption: "ln", value: "ln()", meta: "eval function" },
  { caption: "log", value: "log()", meta: "eval function" },
  { caption: "pow", value: "pow()", meta: "eval function" },
  { caption: "sqrt", value: "sqrt()", meta: "eval function" },
  { caption: "random", value: "random()", meta: "eval function" },

  // Date/Time functions
  { caption: "now", value: "now()", meta: "eval function" },
  { caption: "time", value: "time()", meta: "eval function" },
  { caption: "relative_time", value: "relative_time()", meta: "eval function" },
  { caption: "strftime", value: "strftime()", meta: "eval function" },
  { caption: "strptime", value: "strptime()", meta: "eval function" },

  // Conversion functions
  { caption: "tonumber", value: "tonumber()", meta: "eval function" },
  { caption: "tostring", value: "tostring()", meta: "eval function" },

  // Multivalue functions
  { caption: "mvcount", value: "mvcount()", meta: "eval function" },
  { caption: "mvindex", value: "mvindex()", meta: "eval function" },
  { caption: "mvfilter", value: "mvfilter()", meta: "eval function" },
  { caption: "mvjoin", value: "mvjoin()", meta: "eval function" },
  { caption: "mvappend", value: "mvappend()", meta: "eval function" },
  { caption: "mvdedup", value: "mvdedup()", meta: "eval function" },
  { caption: "mvsort", value: "mvsort()", meta: "eval function" },

  // Type checking functions
  { caption: "isnull", value: "isnull()", meta: "eval function" },
  { caption: "isnotnull", value: "isnotnull()", meta: "eval function" },
  { caption: "isnum", value: "isnum()", meta: "eval function" },
  { caption: "isstr", value: "isstr()", meta: "eval function" },
  { caption: "isbool", value: "isbool()", meta: "eval function" },
  { caption: "typeof", value: "typeof()", meta: "eval function" },
];

// Built-in fields
const splBuiltInFieldsCompleters: SplCompleterItem[] = [
  { caption: "_time", value: "_time", meta: "built-in field" },
  { caption: "_raw", value: "_raw", meta: "built-in field" },
  { caption: "_indextime", value: "_indextime", meta: "built-in field" },
  { caption: "host", value: "host", meta: "built-in field" },
  { caption: "source", value: "source", meta: "built-in field" },
  { caption: "sourcetype", value: "sourcetype", meta: "built-in field" },
  { caption: "index", value: "index", meta: "built-in field" },
  { caption: "splunk_server", value: "splunk_server", meta: "built-in field" },
  { caption: "date_hour", value: "date_hour", meta: "built-in field" },
  { caption: "date_mday", value: "date_mday", meta: "built-in field" },
  { caption: "date_minute", value: "date_minute", meta: "built-in field" },
  { caption: "date_month", value: "date_month", meta: "built-in field" },
  { caption: "date_second", value: "date_second", meta: "built-in field" },
  { caption: "date_wday", value: "date_wday", meta: "built-in field" },
  { caption: "date_year", value: "date_year", meta: "built-in field" },
  { caption: "date_zone", value: "date_zone", meta: "built-in field" },
  { caption: "eventtype", value: "eventtype", meta: "built-in field" },
  { caption: "tag", value: "tag", meta: "built-in field" },
  { caption: "punct", value: "punct", meta: "built-in field" },
];

// Combine all completers
export const splCompleters = [
  {
    getCompletions(
      editor: any,
      session: any,
      pos: any,
      prefix: string,
      callback: any
    ) {
      callback(
        null,
        [
          ...splCommandsCompleters,
          ...splStatsFunctionsCompleters,
          ...splEvalFunctionsCompleters,
          ...splBuiltInFieldsCompleters,
        ].map((item) => ({
          ...item,
          score: item.score ?? 1000,
        }))
      );
    },
  },
];
