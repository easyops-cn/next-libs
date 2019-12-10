import { formatOptions } from "./formatOptions";

describe("formatOptions", () => {
  it("should return format options if the input data is string/number type", () => {
    const optons = ["a", "b", 3, 4];

    const result = formatOptions(optons);

    expect(result).toEqual([
      {
        label: "a",
        value: "a"
      },
      {
        label: "b",
        value: "b"
      },
      {
        label: 3,
        value: 3
      },
      {
        label: 4,
        value: 4
      }
    ]);
  });

  it("should return origin data if the input data is object type", () => {
    const optons = [
      {
        label: "a",
        value: "a"
      },
      {
        label: "b",
        value: "b"
      }
    ];

    const result = formatOptions(optons);
    expect(result).toEqual([
      {
        label: "a",
        value: "a"
      },
      {
        label: "b",
        value: "b"
      }
    ]);
  });

  it("should return empty array if the input data is undefined", () => {
    const result = formatOptions(undefined);

    expect(result).toEqual([]);
  });
});
