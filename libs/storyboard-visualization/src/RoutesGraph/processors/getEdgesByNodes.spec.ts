import { Edge, RouteGraphNode } from "../interfaces";
import { getEdgesByNodes } from "./getEdgesByNodes";

describe("getEdgesByNodes", () => {
  it.each<[nodes: RouteGraphNode[], edges: Edge[]]>([
    [
      [
        {
          originalData: {
            alias: "startup",
            segues: {
              goToHiking: {
                target: "hiking",
              },
              goToCooking: {
                target: "cooking",
                _view: {
                  controls: ["right", "left"],
                },
              },
            },
          },
        },
        {
          originalData: { alias: "hiking" },
        },
        {
          originalData: { alias: "cooking" },
        },
      ],
      [
        {
          source: {
            originalData: expect.objectContaining({
              alias: "startup",
            }),
          },
          target: {
            originalData: { alias: "hiking" },
          },
        },
        {
          source: {
            originalData: expect.objectContaining({
              alias: "startup",
            }),
          },
          target: {
            originalData: { alias: "cooking" },
          },
          controls: ["right", "left"],
        },
      ],
    ],
    [[], []],
    [null, undefined],
  ])("should work", (nodes, edges) => {
    expect(getEdgesByNodes(nodes)).toEqual(edges);
  });
});
