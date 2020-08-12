import { filterActions } from "./filterActions";

describe("filterActions processor", () => {
  it("should filterActions work", () => {
    const result = filterActions(
      {
        useBrick: [
          {
            brick: "div",
            if: "@{item.type}",
          },
          {
            brick: "del",
            if: "@{item.type|not}",
          },
          {
            brick: "a",
            if: "@{item.quality}",
          },
          {
            brick: "b",
            if: "@{item.quality|not}",
          },
        ],
      },
      {
        type: "type1",
      }
    );
    expect(result).toEqual([
      {
        brick: "div",
        if: "@{item.type}",
      },
      {
        brick: "b",
        if: "@{item.quality|not}",
      },
    ]);
  });
});
