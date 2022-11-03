import { IEditorProps } from "react-ace";
import { ExtendedMarker, HighlightTokenSettings } from "../interfaces";

export function getHighlightMarkers({
  editor,
  markerClassMap,
  highlightTokens,
}: {
  editor: IEditorProps;
  markerClassMap: {
    default: string;
    warn: string;
    error: string;
  };
  highlightTokens?: HighlightTokenSettings[];
}): ExtendedMarker[] {
  if (!editor || !highlightTokens?.length) {
    return [];
  }
  const length = editor.session.getLength();
  let state: "initial" | "namespace" | "dot" = "initial";
  const tokenPositions: [
    HighlightTokenSettings,
    string,
    number,
    number,
    number,
    number
  ][] = [];
  let startRow: number;
  let highlightToken: HighlightTokenSettings;
  for (let i = 0; i < length; i++) {
    const tokens = editor.session.getTokens(i);
    let col = 0;
    let startCol: number;
    for (const token of tokens) {
      switch (token.type) {
        case "identifier":
          if (state === "dot") {
            tokenPositions.push([
              highlightToken,
              token.value,
              i,
              startRow === i ? startCol : col,
              i,
              col + token.value.length,
            ]);
          }
          state = "initial";
          break;
        case "punctuation.operator":
          if (state === "namespace" && token.value === ".") {
            state = "dot";
          } else {
            state = "initial";
          }
          break;
        case "support.class.builtin.js":
          if (state === "initial") {
            const currentType =
              token.value === "FN"
                ? "storyboard-function"
                : token.value === "CTX"
                ? "storyboard-context"
                : token.value === "STATE"
                ? "storyboard-state"
                : token.value === "TPL"
                ? "storyboard-tpl-var"
                : token.value === "DS"
                ? "dashboard-DS"
                : null;
            highlightToken = currentType
              ? highlightTokens.find((item) => item.type === currentType)
              : null;
            if (highlightToken) {
              state = "namespace";
              startCol = col;
              startRow = i;
            }
          } else {
            state = "initial";
          }
          break;
        case "text":
          if (!/^\s*$/.test(token.value)) {
            state = "initial";
          }
          break;
        default:
          state = "initial";
      }
      col += token.value.length;
    }
  }
  return tokenPositions.map<ExtendedMarker>(
    ([highlight, identifier, startRow, startCol, endRow, endCol]) => ({
      startRow,
      startCol,
      endRow,
      endCol,
      highlightType: highlight.type,
      identifier,
      className: markerClassMap[highlight.level ?? "default"],
      type: "text",
      inFront: true,
    })
  );
}
