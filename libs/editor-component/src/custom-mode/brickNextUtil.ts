import storyboardJsonSchema from "@next-core/brick-types/.schema/storyboard.json";
import { get } from "lodash";

export const brickNextSnippet = [
  {
    label: "${}",
    caption: "${}",
    snippet: "${${0}}",
    meta: "placeholder",
  },
  {
    label: "<% %>",
    caption: "<% %>",
    snippet: "<% ${0} %>",
    meta: "placeholder",
  },
  {
    label: "@{}",
    caption: "@{}",
    snippet: "@{${0}}",
    meta: "transform",
  },
];

export const brickNextKeywords = [
  "EVENT",
  "DATA",
  "PIPES",
  "PARAMS",
  "PATH",
  "QUERY",
  "QUERY_ARRAY",
  "APP",
  "HASH",
  "ANCHOR",
  "SYS",
  "FLAGS",
  "I18N",
  "CTX",
  "SEGUE",
  "ALIAS",
  "PROCESSORS",
  "IMAGES",
  "TPL",
  "PERMISSIONS",
  "action",
  "target",
  "method",
  "targetRef",
];

// istanbul ignore next
export const brickNextCompleters = [
  {
    identifierRegexps: [/[a-zA-Z_0-9@<$\-\u00A2-\u2000\u2070-\uFFFF]/],
    getCompletions(editor, session, pos, prefix, callback) {
      callback(null, brickNextSnippet);
    },
  },
  {
    getCompletions(editor, session, pos, prefix, callback) {
      callback(
        null,
        brickNextKeywords.map((word) => ({
          caption: word,
          value: word,
          meta: "variable",
          score: 20,
        }))
      );
    },
  },
  {
    getCompletions(editor, session, pos, prefix, callback) {
      const line = session.getLine(pos.row).substr(0, pos.column);
      if (/action(["']?)([\s]*):/.test(line)) {
        callback(
          null,
          get(
            storyboardJsonSchema,
            "definitions.BuiltinBrickEventHandler.properties.action.enum"
          )?.map((word) => ({
            caption: word,
            value: word,
            meta: "event action",
            score: 10,
          }))
        );
      } else {
        callback(null, []);
      }
    },
  },
];
