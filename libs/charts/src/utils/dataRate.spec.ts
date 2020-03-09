import { humanizeDataRateValue } from "./dataRate";
import { DataRateFormatUnitId } from "../constants/format/dataRate";

describe("dateRate", () => {
  it("should humanize data rate value correctly", () => {
    expect(humanizeDataRateValue(8)).toEqual([1, "Bps"]);
    expect(humanizeDataRateValue(8 * 1024)).toEqual([1, "KBps"]);
    expect(humanizeDataRateValue(1024, DataRateFormatUnitId.KBps)).toEqual([
      1,
      "MBps"
    ]);
  });
});
