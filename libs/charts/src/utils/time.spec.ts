import { humanizeTimeValue } from "./time";
import { TimesUnitId as TimeFormatUnitId } from "@next-libs/constants";

describe("time", () => {
  it("should humanize time value correctly", () => {
    expect(humanizeTimeValue(8)).toEqual([8, "ms"]);
    expect(humanizeTimeValue(8, "s" as TimeFormatUnitId)).toEqual([8, "s"]);
  });
});
