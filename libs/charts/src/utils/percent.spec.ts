import { humanizePercentValue } from "./percent";
import { PercentUnitId as PercentFormatUnitId } from "@next-libs/constants";

describe("data", () => {
  it("should humanize data value correctly", () => {
    expect(humanizePercentValue(8)).toEqual(800);
    expect(
      humanizePercentValue(8, "percent(1)" as PercentFormatUnitId)
    ).toEqual(800);
    expect(
      humanizePercentValue(8, "percent(100)" as PercentFormatUnitId)
    ).toEqual(8);
  });
});
