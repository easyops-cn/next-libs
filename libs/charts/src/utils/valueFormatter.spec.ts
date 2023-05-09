import { convertValueByPrecision, formatValue } from "./valueFormatter";

import { FormatType } from "../constants/format";

describe("valueFormatter", () => {
  it("should convert value by precision correctly", () => {
    expect(convertValueByPrecision(1)).toEqual("1");
    expect(convertValueByPrecision(1, 2)).toEqual("1.00");
    expect(convertValueByPrecision(-1)).toEqual("-1");
    expect(convertValueByPrecision(-1, 2)).toEqual("-1.00");
  });

  it("should format value correctly", () => {
    expect(formatValue(1)).toEqual(["1.00", null]);
    expect(formatValue(1, { type: FormatType.None, unit: "个" })).toEqual([
      "1.00",
      "",
    ]);
    expect(formatValue(0.5, { type: FormatType.Percent })).toEqual([
      "50.00%",
      null,
    ]);
    expect(
      formatValue(1024, {
        type: FormatType.DataRate,
        unit: "KBps",
      })
    ).toEqual(["1.00", "MBps"]);
    expect(
      formatValue(1024, {
        unit: "KBps",
      })
    ).toEqual(["1.00", "MBps"]);

    expect(
      formatValue(1000, {
        unit: "bytes(B)",
      })
    ).toEqual(["1.00", "KB"]);

    expect(
      formatValue(1000, {
        unit: "kilobytes(KB)",
      })
    ).toEqual(["1.00", "MB"]);

    expect(
      formatValue(-1000, {
        unit: "kilobytes(KB)",
      })
    ).toEqual(["-1.00", "MB"]);

    expect(
      formatValue(1000, {
        unit: "megabytes(MB)",
      })
    ).toEqual(["1.00", "GB"]);

    expect(
      formatValue(1000, {
        unit: "gigabytes(GB)",
      })
    ).toEqual(["1.00", "TB"]);

    expect(
      formatValue(1000, {
        unit: "terabytes(TB)",
      })
    ).toEqual(["1.00", "PB"]);

    expect(
      formatValue(1000, {
        unit: "petabytes(PB)",
      })
    ).toEqual(["1000.00", "PB"]);

    expect(
      formatValue(1024, {
        unit: "bibytes(B)",
      })
    ).toEqual(["1.00", "KiB"]);

    expect(
      formatValue(1024, {
        unit: "kibibytes(KiB)",
      })
    ).toEqual(["1.00", "MiB"]);

    expect(
      formatValue(-1024, {
        unit: "kibibytes(KiB)",
      })
    ).toEqual(["-1.00", "MiB"]);

    expect(
      formatValue(1024, {
        unit: "mebibytes(MiB)",
      })
    ).toEqual(["1.00", "GiB"]);

    expect(
      formatValue(1024, {
        unit: "gibibytes(GiB)",
      })
    ).toEqual(["1.00", "TiB"]);

    expect(
      formatValue(1024, {
        unit: "tebibytes(TiB)",
      })
    ).toEqual(["1.00", "PiB"]);

    expect(
      formatValue(1024, {
        unit: "pebibytes(PiB)",
      })
    ).toEqual(["1024.00", "PiB"]);

    expect(formatValue(-1)).toEqual(["-1.00", null]);
    expect(formatValue(-1, { type: FormatType.None, unit: "个" })).toEqual([
      "-1.00",
      "",
    ]);
    expect(formatValue(-0.5, { type: FormatType.Percent })).toEqual([
      "-50.00%",
      null,
    ]);
    expect(
      formatValue(-1024, {
        type: FormatType.DataRate,
        unit: "KBps",
      })
    ).toEqual(["-1.00", "MBps"]);
    expect(
      formatValue(-1024, {
        unit: "KBps",
      })
    ).toEqual(["-1.00", "MBps"]);

    expect(
      formatValue(-1024, {
        unit: "KBps",
      })
    ).toEqual(["-1.00", "MBps"]);

    expect(
      formatValue("yellow", {
        type: FormatType.String,
      })
    ).toEqual(["yellow", ""]);
  });
});
