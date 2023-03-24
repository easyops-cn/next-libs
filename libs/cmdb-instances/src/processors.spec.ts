import moment from "moment";
import { Moment } from "moment";
import {
  ATTRIBUTE_ID_PREFIX,
  computeDateFormat,
  isClusterType,
  processAttrValueWithQuote,
} from "./processors";

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
    "processAttrValueWithQuote(%s,any) should return %s",
    (attrValue, expected) => {
      expect(processAttrValueWithQuote(attrValue, [])).toEqual(expected);
    }
  );
});

describe("computeDateFormat", () => {
  const cases: [string, string, any][] = [
    ["date", "2021-03-01", { format: "YYYY-MM-DD", value: 1614528000 }],
    ["date", null, { format: "YYYY-MM-DD", value: null }],
    ["datetime", null, { format: "YYYY-MM-DD HH:mm:ss", value: null }],
    [
      "datetime",
      "2021-03-01 10:00:00",
      { format: "YYYY-MM-DD HH:mm:ss", value: 1614564000 },
    ],
  ];
  it.each(cases)(
    "computeDateFormat(%s,%s) should return %s",
    (format, value, expected) => {
      const result = computeDateFormat(format, value);
      expect(result.format).toEqual(expected.format);
      if (result.value) {
        expect(result.value.unix()).toEqual(expected.value);
      } else {
        expect(result.value).toEqual(expected.value);
      }
    }
  );
});

describe("isClusterType", () => {
  const cases: [string, string, boolean][] = [
    ["CLUSTER", `${ATTRIBUTE_ID_PREFIX}type`, true],
    ["CLUSTER", `_type`, true],
    ["CLUSTER", `type`, true],
    ["CLUSTER", `foo`, false],
    ["CLUSTER", null, false],
    ["HOST", `${ATTRIBUTE_ID_PREFIX}type`, false],
    ["HOST", `_type`, false],
    ["HOST", `type`, false],
    ["HOST", `bar`, false],
  ];

  it.each(cases)(
    "isCluster(%s,%s) should return %s",
    (objectId, type, expected) => {
      const result = isClusterType(objectId, type);
      expect(result).toBe(expected);
    }
  );
});
