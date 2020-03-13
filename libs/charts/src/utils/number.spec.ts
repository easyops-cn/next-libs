import { humanizeNumberValue } from "./number";
import { ShortUnitId } from "@libs/constants";

describe("dateRate", () => {
  it("should humanize data rate value correctly", () => {
    expect(humanizeNumberValue(8)).toEqual("8.00");
    expect(humanizeNumberValue(8000)).toEqual("8.00K");
    expect(humanizeNumberValue(8000000)).toEqual("8.00M");
    expect(humanizeNumberValue(8000000000)).toEqual("8.00B");
    expect(humanizeNumberValue(8000000000000)).toEqual("8.00T");
    expect(humanizeNumberValue(8000, ShortUnitId.K)).toEqual("8.00M");
    expect(humanizeNumberValue(8000, ShortUnitId.M, 1)).toEqual("8.0B");
  });
});
