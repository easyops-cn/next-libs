import { convertValueByPrecision, formatValue } from "./valueFormatter";

import { FormatType, DataRateFormatDisplay } from "../constants/format";

describe("valueFormatter", () => {
  it("should convert value by precision correctly", () => {
    expect(convertValueByPrecision(1)).toEqual("1");
    expect(convertValueByPrecision(1, 2)).toEqual("1.00");
  });

  it("should format value correctly", () => {
    expect(formatValue(1)).toEqual(["1", null]);
    expect(formatValue(1, { type: FormatType.NONE, unit: "个" })).toEqual([
      "1",
      "个"
    ]);
    expect(formatValue(0.5, { type: FormatType.PERCENT })).toEqual([
      "50%",
      null
    ]);
    expect(
      formatValue(1024, {
        type: FormatType.DATA_RATE,
        unit: DataRateFormatDisplay.KILOBYTES_PER_SECOND
      })
    ).toEqual(["1", DataRateFormatDisplay.MEGABYTES_PER_SECOND]);
  });
});
