import { parseDatetimeRange } from "./parseDatetimeRange";

describe("parseDatetimeRange2", () => {
  let dateNowSpy: any;
  beforeAll(() => {
    // Lock Time
    dateNowSpy = jest
      .spyOn(Date, "now")
      .mockImplementation(() => 1560395338643);
  });

  afterAll(() => {
    // Unlock Time
    dateNowSpy.mockRestore();
  });

  const cases: [string, { from: number | ""; to: number | "" }][] = [
    [
      "now-15m",
      {
        from: 1560394438643,
        to: 1560395338643
      }
    ],
    [
      "now-15m",
      {
        from: 1560394438643,
        to: 1560395338643
      }
    ],
    [
      "now-1h",
      {
        from: 1560391738643,
        to: 1560395338643
      }
    ],
    [
      "now-12h",
      {
        from: 1560352138643,
        to: 1560395338643
      }
    ],
    [
      "now-24h",
      {
        from: 1560308938643,
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
        from: 1560355200000,
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
      "now-6M",
      {
        from: 1544670538643,
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
      "now/y",
      {
        from: 1546272000000,
        to: 1560395338643
      }
    ],
    [
      "now-1y",
      {
        from: 1528859338643,
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
