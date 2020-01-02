import { humanizeDataRateValue } from "./dataRate";

import { DataRateFormatDisplay } from "../constants/format/dataRate";

describe("dateRate", () => {
  it("should humanize data rate value correctly", () => {
    expect(humanizeDataRateValue(8)).toEqual([
      1,
      DataRateFormatDisplay.BYTES_PER_SECOND
    ]);
    expect(humanizeDataRateValue(8 * 1024)).toEqual([
      1,
      DataRateFormatDisplay.KILOBYTES_PER_SECOND
    ]);
    expect(
      humanizeDataRateValue(1024, DataRateFormatDisplay.KILOBYTES_PER_SECOND)
    ).toEqual([1, DataRateFormatDisplay.MEGABYTES_PER_SECOND]);
  });
});
