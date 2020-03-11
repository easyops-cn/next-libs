import { viewsToGraph, getNodeDisplayName, computeSourceX } from "./processors";
import { ViewItem, GraphNode } from "./interfaces";
import { fakeBuilderGraphSource, fakeBuilderGraphNode } from "../fakesForTest";
import { HierarchyPointLink } from "d3";

describe("viewsToGraph", () => {
  it.each<[ViewItem[], GraphNode]>([
    [
      undefined,
      {
        nodeType: "route",
        originalData: {
          alias: "APP",
          type: "app"
        },
        height: 56,
        children: []
      }
    ],
    [
      [],
      {
        nodeType: "route",
        originalData: {
          alias: "APP",
          type: "app",
          children: []
        },
        height: 56,
        children: []
      }
    ],
    [
      [
        {
          alias: "route: empty-routes",
          type: "routes"
        }
      ],
      {
        nodeType: "route",
        content: {
          type: "routes",
          items: []
        },
        originalData: {
          alias: "route: empty-routes",
          type: "routes"
        },
        height: 49,
        children: []
      }
    ],
    [
      [
        {
          alias: "route: bricks",
          type: "bricks",
          children: [
            {
              alias: "brick: 1",
              type: "brick"
            }
          ]
        }
      ],
      {
        nodeType: "route",
        content: {
          type: "bricks",
          items: [
            {
              alias: "brick: 1",
              type: "brick"
            }
          ]
        },
        originalData: {
          alias: "route: bricks",
          type: "bricks",
          children: [
            {
              alias: "brick: 1",
              type: "brick"
            }
          ]
        },
        height: 88,
        children: []
      }
    ],
    [fakeBuilderGraphSource(), fakeBuilderGraphNode()]
  ])("viewsToGraph(%j) should return %j", (list, result) => {
    expect(viewsToGraph(list)).toEqual(result);
  });
});

describe("getNodeDisplayName", () => {
  it.each<[ViewItem, string]>([
    [
      {
        alias: "alias-a"
      },
      "alias-a"
    ],
    [
      {
        type: "brick",
        brick: "brick-a"
      },
      "brick-a"
    ],
    [
      {
        alias: "alias-b",
        type: "brick",
        brick: "brick-a"
      },
      "alias-b"
    ],
    [
      {
        type: "brick",
        brick: "your.brick-b"
      },
      "brick-b"
    ],
    [
      {
        type: "template",
        template: "your.template-a"
      },
      "template-a"
    ],
    [
      {
        type: "routes",
        path: "/your-page-a"
      },
      "/your-page-a"
    ]
  ])("getNodeDisplayName(%j) should return %j", (data, displayName) => {
    expect(getNodeDisplayName(data)).toBe(displayName);
  });
});

describe("computeSourceX", () => {
  const nodeA: ViewItem = {};
  it.each<[HierarchyPointLink<GraphNode>, number]>([
    [
      {
        source: {
          data: {},
          x: 10
        },
        target: {}
      },
      10
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "unknown"
            }
          },
          x: 10
        },
        target: {}
      },
      10
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "bricks",
              items: [{}, nodeA]
            },
            height: 100
          },
          x: 10
        },
        target: {
          data: {
            originalData: nodeA
          }
        }
      },
      63
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "slots",
              slots: [
                {
                  items: [{}]
                },
                {
                  items: [{}, nodeA]
                }
              ]
            },
            height: 100
          },
          x: 10
        },
        target: {
          data: {
            originalData: nodeA
          }
        }
      },
      170
    ]
  ] as any)("computeSourceX(%j) should return %j", (link, x) => {
    expect(computeSourceX(link)).toBe(x);
  });
});
