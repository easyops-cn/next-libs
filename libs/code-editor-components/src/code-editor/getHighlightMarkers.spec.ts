import { ExtendedMarker, HighlightTokenSettings } from "../interfaces";
import { getHighlightMarkers } from "./getHighlightMarkers";

interface Token {
  type: string;
  value: string;
}

describe("getHighlightMarkers", () => {
  const nonRelevantLine: Token[] = [
    {
      type: "meta.tag",
      value: "pipeline",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "text",
      value: " ",
    },
    {
      type: "string",
      value: "|",
    },
  ];
  const mixedCtxAndFnLine: Token[] = [
    {
      type: "text",
      value: "  ",
    },
    {
      type: "placeholder.start",
      value: `<% `,
    },
    {
      type: "support.class.builtin.js",
      value: "CTX",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "abc",
    },
    {
      type: "punctuation.operator",
      value: ",",
    },
    {
      type: "support.class.builtin.js",
      value: "FN",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "def",
    },
    {
      type: "punctuation.operator",
      value: ",",
    },
    {
      type: "support.class.builtin.js",
      value: "DS",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "qwe",
    },
    {
      type: "punctuation.operator",
      value: ",",
    },
    {
      type: "support.class.builtin.js",
      value: "STATE",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "ghi",
    },
    {
      type: "punctuation.operator",
      value: ",",
    },
    {
      type: "support.class.builtin.js",
      value: "TPL",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "jkl",
    },
    {
      type: "punctuation.operator",
      value: ",",
    },
    {
      type: "support.class.builtin.js",
      value: "DATA",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "xyz",
    },
    {
      type: "placeholder.end",
      value: " %>",
    },
  ];
  const fnCrossLines: Token[][] = [
    [
      {
        type: "placeholder.start",
        value: `<% `,
      },
    ],
    [
      {
        type: "text",
        value: "  ",
      },
      {
        type: "support.class.builtin.js",
        value: "FN",
      },
    ],
    [
      {
        type: "text",
        value: "  ",
      },
      {
        type: "punctuation.operator",
        value: ".",
      },
      {
        type: "identifier",
        value: "ghi",
      },
    ],
  ];
  const namespaceAfterNamespaceLine: Token[] = [
    {
      type: "support.class.builtin.js",
      value: "FN",
    },
    {
      type: "text",
      value: "  ",
    },
    {
      type: "support.class.builtin.js",
      value: "FN",
    },
  ];
  const nonEmptyTextLine: Token[] = [
    {
      type: "support.class.builtin.js",
      value: "FN",
    },
    {
      type: "text",
      value: "?",
    },
    {
      type: "punctuation.operator",
      value: ".",
    },
    {
      type: "identifier",
      value: "ghi",
    },
  ];
  const contextActionLine: Token[] = [
    {
      type: "meta.tag",
      value: "action",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "text",
      value: " context.refresh ",
    },
  ];
  const stateActionLine: Token[] = [
    {
      type: "meta.tag",
      value: "action",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "text",
      value: "state.refresh",
    },
  ];
  const otherActionLine: Token[] = [
    {
      type: "meta.tag",
      value: "action",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "text",
      value: "console.log",
    },
  ];
  const tagNameAsTargetLine: Token[] = [
    {
      type: "meta.tag",
      value: "target",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "string.start",
      value: "'",
    },
    {
      type: "string",
      value: "my\\.bad-brick'",
    },
  ];
  const otherTargetLine: Token[] = [
    {
      type: "meta.tag",
      value: "target",
    },
    {
      type: "keyword",
      value: ":",
    },
    {
      type: "string.start",
      value: "'",
    },
    {
      type: "string",
      value: ".good-brick'",
    },
  ];

  it.each<{
    doc: Token[][];
    highlightTokens?: HighlightTokenSettings[];
    markers: ExtendedMarker[];
    nullEditor?: boolean;
  }>([
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokens: [{ type: "storyboard-function" }],
      markers: [
        {
          className: "highlight-marker",
          endCol: 19,
          endRow: 1,
          highlightType: "storyboard-function",
          identifier: "def",
          inFront: true,
          startCol: 13,
          startRow: 1,
          type: "text",
        },
      ],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokens: [{ type: "storyboard-context" }],
      markers: [
        {
          className: "highlight-marker",
          endCol: 12,
          endRow: 1,
          highlightType: "storyboard-context",
          identifier: "abc",
          inFront: true,
          startCol: 5,
          startRow: 1,
          type: "text",
        },
      ],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokens: [
        { type: "storyboard-function" },
        { type: "storyboard-context" },
        { type: "storyboard-state", level: "error" },
        { type: "storyboard-tpl-var", level: "warn" },
        { type: "dashboard-DS" },
      ],
      markers: [
        {
          className: "highlight-marker",
          endCol: 12,
          endRow: 1,
          highlightType: "storyboard-context",
          identifier: "abc",
          inFront: true,
          startCol: 5,
          startRow: 1,
          type: "text",
        },
        {
          className: "highlight-marker",
          endCol: 19,
          endRow: 1,
          highlightType: "storyboard-function",
          identifier: "def",
          inFront: true,
          startCol: 13,
          startRow: 1,
          type: "text",
        },
        {
          className: "highlight-marker",
          endCol: 26,
          endRow: 1,
          highlightType: "dashboard-DS",
          identifier: "qwe",
          inFront: true,
          startCol: 20,
          startRow: 1,
          type: "text",
        },
        {
          className: "error-marker",
          endCol: 36,
          endRow: 1,
          highlightType: "storyboard-state",
          identifier: "ghi",
          inFront: true,
          startCol: 27,
          startRow: 1,
          type: "text",
        },
        {
          className: "warn-marker",
          endCol: 44,
          endRow: 1,
          highlightType: "storyboard-tpl-var",
          identifier: "jkl",
          inFront: true,
          startCol: 37,
          startRow: 1,
          type: "text",
        },
      ],
    },
    {
      doc: [nonRelevantLine, ...fnCrossLines],
      highlightTokens: [{ type: "storyboard-function" }],
      markers: [
        {
          className: "highlight-marker",
          endCol: 6,
          endRow: 3,
          highlightType: "storyboard-function",
          identifier: "ghi",
          inFront: true,
          startCol: 3,
          startRow: 3,
          type: "text",
        },
      ],
    },
    {
      doc: [contextActionLine, stateActionLine, otherActionLine],
      highlightTokens: [{ type: "storyboard-context-action", level: "warn" }],
      markers: [
        {
          className: "warn-marker",
          endCol: 23,
          endRow: 0,
          highlightType: "storyboard-context-action",
          identifier: "context.refresh",
          inFront: true,
          startCol: 8,
          startRow: 0,
          type: "text",
        },
      ],
    },
    {
      doc: [contextActionLine, stateActionLine, otherActionLine],
      highlightTokens: [{ type: "storyboard-state-action", level: "error" }],
      markers: [
        {
          className: "error-marker",
          endCol: 20,
          endRow: 1,
          highlightType: "storyboard-state-action",
          identifier: "state.refresh",
          inFront: true,
          startCol: 7,
          startRow: 1,
          type: "text",
        },
      ],
    },
    {
      doc: [tagNameAsTargetLine, otherTargetLine],
      highlightTokens: [
        { type: "storyboard-tag-name-as-target", level: "warn" },
      ],
      markers: [
        {
          className: "warn-marker",
          endCol: 21,
          endRow: 0,
          highlightType: "storyboard-tag-name-as-target",
          identifier: "my\\.bad-brick",
          inFront: true,
          startCol: 8,
          startRow: 0,
          type: "text",
        },
      ],
    },
    {
      doc: [nonRelevantLine, namespaceAfterNamespaceLine],
      highlightTokens: [{ type: "storyboard-context" }],
      markers: [],
    },
    {
      doc: [nonRelevantLine, nonEmptyTextLine],
      highlightTokens: [{ type: "storyboard-context" }],
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      // highlightTokens: undefined,
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokens: [],
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokens: [{ type: "storyboard-context" }],
      markers: [],
      nullEditor: true,
    },
  ])("should work", ({ doc, highlightTokens, markers, nullEditor }) => {
    const editor = nullEditor
      ? null
      : ({
          session: {
            getLength() {
              return doc.length;
            },
            getTokens(line: number): Token[] {
              return doc[line];
            },
          },
        } as any);
    const receivedMarkers = getHighlightMarkers({
      editor,
      markerClassMap: {
        default: "highlight-marker",
        warn: "warn-marker",
        error: "error-marker",
      },
      highlightTokens,
    });
    expect(receivedMarkers).toEqual(markers);
  });
});
