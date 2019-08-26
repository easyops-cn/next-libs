import { costTime } from "./costTime";

describe("costTime", () => {
  const testCases = [
    [null, undefined, undefined, ""],
    [undefined, undefined, "0001-01-01T00:00:00Z", ""],
    [21, undefined, undefined, "0.021 秒"],
    [210, undefined, undefined, "0.2 秒"],
    [1234, undefined, undefined, "1.2 秒"],
    [123456, undefined, undefined, "2 分钟 3 秒"],
    [12345678, undefined, undefined, "3 小时 25 分钟"],
    [1234567890, undefined, undefined, "14 天 6 小时"],
    [
      undefined,
      "2018-01-02T03:04:05Z",
      "2018-01-02T13:14:15Z",
      "10 小时 10 分钟"
    ]
  ];

  it.each(testCases)(
    "costTime(%s, %s, %s) should return '%s'",
    (cost, start, end, expected) => {
      expect(costTime(cost, start, end)).toBe(expected);
    }
  );
});
