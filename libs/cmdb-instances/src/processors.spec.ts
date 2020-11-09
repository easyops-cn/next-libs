import { processAttrValueWithQuote } from "./processors";

describe("processAttrValueWithQuote", () => {
  const cases: [string, string[]][] = [
    ['"ab 9""12"', ["ab 9", "12"]],
    ['0"ab 9"ah', ["0", "ab 9", "ah"]],
    ['"ab 9"0"12', ["ab 9", '0"12']],
    ['""ab 12""', ["ab", "12"]],
    ["“ab 9”", ["“ab", "9”"]],
    ["ab 9", ["ab", "9"]],
  ];
  it.each(cases)(
    "processAttrValueWithQuote(%s,%s) should return %s",
    (attrValue, expected) => {
      expect(processAttrValueWithQuote(attrValue, [])).toEqual(expected);
    }
  );
});
