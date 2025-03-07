import { humanizeDataRateValue } from "./dataRate";
import { ByteRatesUnitId as DataRateFormatUnitId } from "@next-libs/constants";

describe("dateRate", () => {
  it("should humanize data rate value correctly", () => {
    expect(humanizeDataRateValue(8)).toEqual([1, "Bps"]);
    expect(humanizeDataRateValue(8 * 1000)).toEqual([1, "KBps"]);
    expect(humanizeDataRateValue(1000, DataRateFormatUnitId.KBps)).toEqual([
      1,
      "MBps",
    ]);

    expect(humanizeDataRateValue(-8)).toEqual([-1, "Bps"]);
    expect(humanizeDataRateValue(-8 * 1000)).toEqual([-1, "KBps"]);
    expect(humanizeDataRateValue(-1000, DataRateFormatUnitId.KBps)).toEqual([
      -1,
      "MBps",
    ]);
  });
});
