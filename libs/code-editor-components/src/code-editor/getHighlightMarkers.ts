import { IEditorProps } from "react-ace";
import { ExtendedMarker, HighlightTokenType } from "../interfaces";

export function getHighlightMarkers({
  editor,
  markerClassName,
  highlightTokenTypes,
}: {
  editor: IEditorProps;
  markerClassName: string;
  highlightTokenTypes?: HighlightTokenType[];
}): ExtendedMarker[] {
  if (!editor || !highlightTokenTypes?.length) {
    return [];
  }
  const length = editor.session.getLength();
  let state: "initial" | "namespace" | "dot" = "initial";
  const tokenPositions: [
    HighlightTokenType,
    string,
    number,
    number,
    number,
    number
  ][] = [];
  let startRow: number;
  let highlightType: HighlightTokenType;
  for (let i = 0; i < length; i++) {
    const tokens = editor.session.getTokens(i);
    let col = 0;
    let startCol: number;
    for (const token of tokens) {
      switch (token.type) {
        case "identifier":
          if (state === "dot") {
            tokenPositions.push([
              highlightType,
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
            highlightType =
              token.value === "FN"
                ? "storyboard-function"
                : token.value === "CTX"
                ? "storyboard-context"
                : token.value === "DS"
                ? "dashboard-DS"
                : null;
            if (highlightType && highlightTokenTypes.includes(highlightType)) {
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
    ([highlightType, identifier, startRow, startCol, endRow, endCol]) => ({
      startRow,
      startCol,
      endRow,
      endCol,
      highlightType,
      identifier,
      className: markerClassName,
      type: "text",
      inFront: true,
    })
  );
}
