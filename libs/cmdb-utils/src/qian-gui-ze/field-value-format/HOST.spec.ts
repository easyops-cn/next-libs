import hostFormatter from "./HOST";

describe("cpuHz formatter", () => {
  const testcases = [
    [2400, "2.4 GHz"],
    [0, "0 Hz"],
    [null, ""],
    [undefined, ""],
  ];
  it.each(testcases)(`cpuHz(%s) should return %s`, (frequency, expected) => {
    expect(hostFormatter.cpuHz(frequency)).toBe(expected);
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
    expect(hostFormatter.memSize(memSize)).toBe(expected);
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
    expect(hostFormatter.diskSize(memSize)).toBe(expected);
  });
});
