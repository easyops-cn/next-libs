import { humanizeDataValue } from "./data";
import { BytesUnitId as DataFormatUnitId } from "@next-libs/constants";

describe("data", () => {
  it("should humanize data value correctly", () => {
    expect(humanizeDataValue(8)).toEqual([1, "B"]);
    expect(humanizeDataValue(8, "bytes" as DataFormatUnitId)).toEqual([8, "B"]);
  });
});
