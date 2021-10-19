import { getEdgePath } from "./getEdgePath";
import { Edge } from "../interfaces";

describe("getEdgePath", () => {
  it.each<[edge: Edge, path: string]>([
    [
      {
        source: {
          x: 10,
          y: 20,
          originalData: {},
        },
        target: {
          x: 200,
          y: 300,
          originalData: {},
        },
      },
      "M90,224C90,261.5,280,261.5,280,299",
    ],
    [
      {
        source: {
          x: 10,
          y: 20,
          originalData: {
            graphInfo: {
              viewType: "dialog",
            },
          },
        },
        target: {
          x: 200,
          y: 300,
          originalData: {
            graphInfo: {
              viewType: "drawer",
            },
          },
        },
        controls: ["right", "left"],
      },
      "M166,74C182.5,74,182.5,396.5,199,396.5",
    ],
  ])("should work", (edge, path) => {
    expect(getEdgePath(edge)).toBe(path);
  });
});
