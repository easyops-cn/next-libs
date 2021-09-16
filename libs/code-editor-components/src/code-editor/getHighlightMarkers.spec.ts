import { ExtendedMarker, HighlightTokenType } from "../interfaces";
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
  const fnCrossLine: Token[][] = [
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

  it.each<{
    doc: Token[][];
    highlightTokenTypes: HighlightTokenType[];
    markers: ExtendedMarker[];
    nullEditor?: boolean;
  }>([
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokenTypes: ["storyboard-function"],
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
      highlightTokenTypes: ["storyboard-context"],
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
      highlightTokenTypes: ["storyboard-function", "storyboard-context"],
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
      ],
    },
    {
      doc: [nonRelevantLine, ...fnCrossLine],
      highlightTokenTypes: ["storyboard-function"],
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
      doc: [nonRelevantLine, namespaceAfterNamespaceLine],
      highlightTokenTypes: ["storyboard-function"],
      markers: [],
    },
    {
      doc: [nonRelevantLine, nonEmptyTextLine],
      highlightTokenTypes: ["storyboard-function"],
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokenTypes: undefined,
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokenTypes: [],
      markers: [],
    },
    {
      doc: [nonRelevantLine, mixedCtxAndFnLine],
      highlightTokenTypes: ["storyboard-function"],
      markers: [],
      nullEditor: true,
    },
  ])("should work", ({ doc, highlightTokenTypes, markers, nullEditor }) => {
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
      markerClassName: "highlight-marker",
      highlightTokenTypes,
    });
    expect(receivedMarkers).toEqual(markers);
  });
});
