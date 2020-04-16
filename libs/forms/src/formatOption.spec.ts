import { formatOptions } from "./formatOptions";

describe("formatOptions", () => {
  it("should return format options if the input data is string/number type", () => {
    const optons = ["a", "b", 3, 4];

    const result = formatOptions(optons);

    expect(result).toEqual([
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
      },
      {
        label: 3,
        value: 3,
      },
      {
        label: 4,
        value: 4,
      },
    ]);
  });
  it("should return format options if the input data is boolean type", () => {
    const optons = [true, false];

    const result = formatOptions(optons);

    expect(result).toEqual([
      {
        label: "true",
        value: true,
      },
      {
        label: "false",
        value: false,
      },
    ]);
  });

  it.each([{}, ""])(
    "should return origin data if the input data is object type",
    (fields) => {
      const optons = [
        {
          label: "a",
          value: "a",
        },
        {
          label: "b",
          value: "b",
        },
      ];
      const result = formatOptions(optons, fields);
      expect(result).toEqual([
        {
          label: "a",
          value: "a",
        },
        {
          label: "b",
          value: "b",
        },
      ]);
    }
  );

  it("should return empty array if the input data is undefined", () => {
    const result = formatOptions(undefined);

    expect(result).toEqual([]);
  });

  it("should return fields set", () => {
    const optons = [
      {
        aaa: "a",
        bbb: "a",
      },
      {
        aaa: "b",
        bbb: "b",
      },
    ];

    const result = formatOptions(optons, { label: "aaa", value: "bbb" });
    expect(result).toEqual([
      {
        aaa: "a",
        bbb: "a",
        label: "a",
        value: "a",
      },
      {
        aaa: "b",
        bbb: "b",
        label: "b",
        value: "b",
      },
    ]);
  });

  it("should return fields set with nested path", () => {
    const optons = [
      {
        aabb: {
          aaa: "a",
          bbb: "a",
        },
      },
      {
        aabb: {
          aaa: "b",
          bbb: "b",
        },
      },
    ];

    const result = formatOptions(optons, {
      label: "aabb.aaa",
      value: "aabb.bbb",
    });
    expect(result).toEqual([
      {
        aabb: { aaa: "a", bbb: "a" },
        label: "a",
        value: "a",
      },
      {
        aabb: { aaa: "b", bbb: "b" },
        label: "b",
        value: "b",
      },
    ]);
  });
});
