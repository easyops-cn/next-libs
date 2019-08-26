import { parseDatetimeRange } from "./parseDatetimeRange";
jest.mock("moment", () => () => 1560395338643);
describe("parseDatetimeRange", () => {
  const cases: [string, { from: number | ""; to: number | "" }][] = [
    [
      "now-1h",
      {
        from: 1560391738643,
        to: 1560395338643
      }
    ],
    [
      "now-1d",
      {
        from: 1560308938643,
        to: 1560395338643
      }
    ],
    [
      "now/d",
      {
        from: 1560395338643,
        to: 1560395338643
      }
    ],
    [
      "now-7d",
      {
        from: 1559790538643,
        to: 1560395338643
      }
    ],
    [
      "now-30d",
      {
        from: 1557803338643,
        to: 1560395338643
      }
    ],
    [
      "1560395338643",
      {
        from: "",
        to: ""
      }
    ]
  ];
  it.each(cases)("getStateInfo(%s) should return %j", (value, expected) => {
    expect(parseDatetimeRange(value)).toEqual(expected);
  });
});
