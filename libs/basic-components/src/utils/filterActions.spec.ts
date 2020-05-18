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
            brick: "div",
            if: "@{item.type|not}",
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
    ]);
  });
});
