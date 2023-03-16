import { formatBytes, decimalBytes, customRules } from "./utils";
test("formatBytes", () => {
  expect(formatBytes(-42, 0)).toBe("-42 B");
  expect(formatBytes(1000 * 2 ** 20, 0)).toBe("1000 MB");
  expect(formatBytes(2349 * 1000 ** 2, 1, "Hz")).toBe("2.3 GHz");
  expect(formatBytes(2350 * 1000 * 1000, 1, "Hz")).toBe("2.4 GHz");
  expect(formatBytes(2400 * 1000 * 1000, 1, "Hz")).toBe("2.4 GHz");
  expect(formatBytes(2449 * 1000 * 1000, 2, "Hz")).toBe("2.45 GHz");
  expect(formatBytes(2.3 * 2 ** 30)).toBe("2.3 GB");
  expect(formatBytes(4.2 * 2 ** 40)).toBe("4.2 TB");
  expect(formatBytes(-300 * 2 ** 40, 0, "B", "auto", true)).toBe("-300 TiB");
  expect(formatBytes(1024 * 2 ** 40)).toBe("1 PB");
  expect(formatBytes(2 * 2 ** 60)).toBe("2048 PB");
  expect(formatBytes(Number.MAX_VALUE, 2)).toBe("1.6e+293 PB");
  expect(formatBytes(1)).toBe("1 B");
  expect(formatBytes(0)).toBe("0 B");
  expect(formatBytes(0.0)).toBe("0 B");
  expect(formatBytes(0.01)).toBe("0 B");
  expect(formatBytes(-0.049)).toBe("0 B");
  expect(formatBytes(-0.05)).toBe("-0.1 B");
  expect(formatBytes(Infinity)).toBe("-");
  expect(formatBytes(undefined)).toBe("-");
  expect(formatBytes([])).toBe("-");
  expect(formatBytes({})).toBe("-");
});

test("decimalBytes", () => {
  expect(decimalBytes(1000 * 10 ** 6, 0)).toBe("1 GB");
  // prefix test
  expect(decimalBytes(2349 * 1000 ** 2, 1, "Hz")).toBe("2.3 GHz");
  expect(decimalBytes(2350 * 1000 * 1000, 1, "Hz")).toBe("2.4 GHz");
  expect(decimalBytes(2400 * 1000 * 1000, 1, "Hz")).toBe("2.4 GHz");
  expect(decimalBytes(2449 * 1000 * 1000, 2, "Hz")).toBe("2.45 GHz");
  expect(decimalBytes(2.3 * 2 ** 30)).toBe("2.5 GB");
  // 二进制
  expect(decimalBytes(-300 * 2 ** 40, 0, "B", true, true)).toBe("-300 TiB");

  expect(decimalBytes(Number.MAX_VALUE, 2)).toBe("1.8e+293 PB");

  expect(decimalBytes(-42, 0)).toBe("-42 B");
  expect(decimalBytes(1)).toBe("1 B");
  expect(decimalBytes(0)).toBe("0 B");
  expect(decimalBytes(0.0)).toBe("0 B");
  expect(decimalBytes(0.01)).toBe("0 B");
  expect(decimalBytes(-0.049)).toBe("0 B");
  expect(decimalBytes(-0.05)).toBe("-0.1 B");
  // NaN test
  expect(decimalBytes(Infinity)).toBe("-");
  expect(decimalBytes(undefined)).toBe("-");
  expect(decimalBytes([])).toBe("-");
  expect(decimalBytes({})).toBe("-");
});
describe("cpuHz formatter", () => {
  const testcases = [
    [2400, "2.4 GHz"],
    [0, "0 Hz"],
    [null, ""],
    [undefined, ""],
  ];
  it.each(testcases)(`cpuHz(%s) should return %s`, (frequency, expected) => {
    expect(customRules.cpuHz(frequency)).toBe(expected);
  });
});

describe("memSize formatter", () => {
  const testcases = [
    [2400, "2.40 MB"],
    [0, "0 KB"],
    [null, ""],
    [undefined, ""],
  ];
  it.each(testcases)(`memSize(%s) should return %s`, (memSize, expected) => {
    expect(customRules.memSize(memSize)).toBe(expected);
  });
});

describe("diskSize formatter", () => {
  const testcases = [
    [2400, "2.40 MB"],
    [0, "0 KB"],
    [null, ""],
    [undefined, ""],
  ];
  it.each(testcases)(`diskSize(%s) should return %s`, (memSize, expected) => {
    expect(customRules.diskSize(memSize)).toBe(expected);
  });
});
