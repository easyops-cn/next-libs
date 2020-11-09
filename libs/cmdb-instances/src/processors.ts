import { getRuntime } from "@easyops/brick-kit";
import { uniq, compact } from "lodash";

const featureFlags =
  process.env.NODE_ENV === "test"
    ? { "cmdb-advance-search-with-quote": true }
    : getRuntime().getFeatureFlags();
export const ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE =
  featureFlags["cmdb-advance-search-with-quote"];

export const processAttrValueWithQuote = (
  attrValue: string,
  resultArray: any
): any => {
  const quoteIndex = attrValue.indexOf('"');
  const nextQuoteIndex = attrValue.indexOf('"', quoteIndex + 1);
  if (nextQuoteIndex == -1 || quoteIndex === -1) {
    if (attrValue.length) {
      resultArray = [...resultArray, ...attrValue.split(" ")];
    }
    return uniq(compact(resultArray));
  } else if (nextQuoteIndex != -1) {
    if (quoteIndex !== 0) {
      resultArray = [
        ...resultArray,
        ...attrValue.slice(0, quoteIndex).split(" "),
      ];
      resultArray.push(attrValue.slice(quoteIndex + 1, nextQuoteIndex));
      return processAttrValueWithQuote(
        attrValue.slice(nextQuoteIndex + 1),
        resultArray
      );
    } else {
      resultArray.push(attrValue.slice(quoteIndex + 1, nextQuoteIndex));
      return processAttrValueWithQuote(
        attrValue.slice(nextQuoteIndex + 1),
        resultArray
      );
    }
  }
};
