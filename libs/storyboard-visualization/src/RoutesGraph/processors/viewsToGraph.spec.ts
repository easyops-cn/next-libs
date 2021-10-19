import { viewsToGraph } from "./viewsToGraph";

describe("viewsToGraph", () => {
  it.each<
    [
      input: Parameters<typeof viewsToGraph>[0],
      output: ReturnType<typeof viewsToGraph>
    ]
  >([
    [
      [
        {
          alias: "a",
          graphInfo: {
            viewType: "dialog",
          },
        },
        {
          alias: "b",
        },
      ],
      [
        {
          originalData: {
            alias: "a",
            graphInfo: {
              viewType: "dialog",
            },
          },
          nodeConfig: {
            width: 160,
            height: 108,
          },
        },
        {
          originalData: {
            alias: "b",
          },
          nodeConfig: {
            width: 160,
            height: 208,
          },
        },
      ],
    ],
    [[], []],
    [null, undefined],
  ])("should work", (input, output) => {
    expect(viewsToGraph(input)).toEqual(output);
  });
});
