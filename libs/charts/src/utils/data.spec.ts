import { humanizeDataValue } from "./data";
import {
  BytesUnitId,
  BytesUnitId as DataFormatUnitId,
} from "@next-libs/constants";

describe("data", () => {
  it("should humanize data value correctly", () => {
    expect(humanizeDataValue(8)).toEqual([1, "B"]);
    expect(humanizeDataValue(8, "bytes" as DataFormatUnitId)).toEqual([8, "B"]);
    expect(humanizeDataValue(-8)).toEqual([-1, "B"]);
    expect(humanizeDataValue(-8, "bytes" as DataFormatUnitId)).toEqual([
      -8,
      "B",
    ]);

    expect(humanizeDataValue(1000, "bytes(B)" as BytesUnitId)).toEqual([
      1,
      "KB",
    ]);

    expect(humanizeDataValue(1000, "kilobytes(KB)" as BytesUnitId)).toEqual([
      1,
      "MB",
    ]);

    expect(humanizeDataValue(1000, "megabytes(MB)" as BytesUnitId)).toEqual([
      1,
      "GB",
    ]);

    expect(humanizeDataValue(1000, "gigabytes(GB)" as BytesUnitId)).toEqual([
      1,
      "TB",
    ]);

    expect(humanizeDataValue(1000, "terabytes(TB)" as BytesUnitId)).toEqual([
      1,
      "PB",
    ]);

    expect(humanizeDataValue(1000, "petabytes(PB)" as BytesUnitId)).toEqual([
      1000,
      "PB",
    ]);

    expect(humanizeDataValue(1, "bibytes(B)" as BytesUnitId)).toEqual([1, "B"]);

    expect(humanizeDataValue(1024, "bibytes(B)" as BytesUnitId)).toEqual([
      1,
      "KiB",
    ]);

    expect(humanizeDataValue(1024, "kibibytes(KiB)" as BytesUnitId)).toEqual([
      1,
      "MiB",
    ]);

    expect(humanizeDataValue(1024, "mebibytes(MiB)" as BytesUnitId)).toEqual([
      1,
      "GiB",
    ]);

    expect(humanizeDataValue(1024, "gibibytes(GiB)" as BytesUnitId)).toEqual([
      1,
      "TiB",
    ]);

    expect(humanizeDataValue(1024, "tebibytes(TiB)" as BytesUnitId)).toEqual([
      1,
      "PiB",
    ]);

    expect(humanizeDataValue(1024, "pebibytes(PiB)" as BytesUnitId)).toEqual([
      1024,
      "PiB",
    ]);

    expect(humanizeDataValue(-1000, "bytes(B)" as BytesUnitId)).toEqual([
      -1,
      "KB",
    ]);

    expect(humanizeDataValue(-1000, "kilobytes(KB)" as BytesUnitId)).toEqual([
      -1,
      "MB",
    ]);

    expect(humanizeDataValue(-1000, "megabytes(MB)" as BytesUnitId)).toEqual([
      -1,
      "GB",
    ]);

    expect(humanizeDataValue(-1000, "gigabytes(GB)" as BytesUnitId)).toEqual([
      -1,
      "TB",
    ]);

    expect(humanizeDataValue(-1000, "terabytes(TB)" as BytesUnitId)).toEqual([
      -1,
      "PB",
    ]);

    expect(humanizeDataValue(-1000, "petabytes(PB)" as BytesUnitId)).toEqual([
      -1000,
      "PB",
    ]);

    expect(humanizeDataValue(-1, "bibytes(B)" as BytesUnitId)).toEqual([
      -1,
      "B",
    ]);

    expect(humanizeDataValue(-1024, "bibytes(B)" as BytesUnitId)).toEqual([
      -1,
      "KiB",
    ]);

    expect(humanizeDataValue(-1024, "bibytes(B)" as BytesUnitId)).toEqual([
      -1,
      "KiB",
    ]);

    expect(humanizeDataValue(-1024, "kibibytes(KiB)" as BytesUnitId)).toEqual([
      -1,
      "MiB",
    ]);

    expect(humanizeDataValue(-1024, "mebibytes(MiB)" as BytesUnitId)).toEqual([
      -1,
      "GiB",
    ]);

    expect(humanizeDataValue(-1024, "gibibytes(GiB)" as BytesUnitId)).toEqual([
      -1,
      "TiB",
    ]);

    expect(humanizeDataValue(-1024, "tebibytes(TiB)" as BytesUnitId)).toEqual([
      -1,
      "PiB",
    ]);

    expect(humanizeDataValue(-1024, "pebibytes(PiB)" as BytesUnitId)).toEqual([
      -1024,
      "PiB",
    ]);
  });
});
