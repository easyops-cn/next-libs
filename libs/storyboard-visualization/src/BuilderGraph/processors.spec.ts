import { viewsToGraph, getNodeDisplayName, computeSourceX } from "./processors";
import { GraphNode } from "./interfaces";
import { ViewItem } from "../shared/interfaces";
import { fakeBuilderGraphSource, fakeBuilderGraphNode } from "../fakesForTest";
import { HierarchyPointLink } from "d3";

describe("viewsToGraph", () => {
  it.each<[ViewItem[], boolean | "auto", GraphNode]>([
    [
      undefined,
      "auto",
      {
        nodeType: "unknown",
        originalData: {
          alias: "APP",
          type: "app-root",
          children: [],
        },
        height: 39,
        content: {
          type: "routes",
          items: [],
        },
        children: [],
      },
    ],
    [
      [],
      "auto",
      {
        nodeType: "unknown",
        originalData: {
          alias: "APP",
          type: "app-root",
          children: [],
        },
        height: 39,
        content: {
          type: "routes",
          items: [],
        },
        children: [],
      },
    ],
    [
      [
        {
          alias: "route: empty-routes",
          type: "routes",
        },
      ],
      "auto",
      {
        content: {
          type: "routes",
          items: [
            {
              alias: "route: empty-routes",
              type: "routes",
            },
          ],
        },
        originalData: {
          alias: "Route",
          type: "route-root",
          children: [
            {
              alias: "route: empty-routes",
              type: "routes",
            },
          ],
        },
        height: 74,
        children: [],
        nodeType: "unknown",
      },
    ],
    [
      [
        {
          alias: "route: bricks",
          type: "bricks",
          children: [
            {
              alias: "brick: 1",
              type: "brick",
            },
          ],
        },
      ],
      "auto",
      {
        content: {
          items: [
            {
              alias: "route: bricks",
              children: [
                {
                  alias: "brick: 1",
                  type: "brick",
                },
              ],
              type: "bricks",
            },
          ],
          type: "routes",
        },
        originalData: {
          alias: "Route",
          type: "route-root",
          children: [
            {
              alias: "route: bricks",
              type: "bricks",
              children: [
                {
                  alias: "brick: 1",
                  type: "brick",
                },
              ],
            },
          ],
        },
        height: 74,
        children: [
          {
            height: 74,
            nodeType: "route",
            originalData: {
              alias: "route: bricks",
              children: [
                {
                  alias: "brick: 1",
                  type: "brick",
                },
              ],
              type: "bricks",
            },
            children: [],
            content: {
              type: "bricks",
              items: [
                {
                  alias: "brick: 1",
                  type: "brick",
                },
              ],
            },
          },
        ],
        nodeType: "unknown",
      },
    ],
    [
      [
        {
          alias: "route: empty-routes",
          type: "routes",
        },
      ],
      true,
      {
        nodeType: "unknown",
        originalData: {
          alias: "APP",
          type: "app-root",
          children: [
            {
              alias: "route: empty-routes",
              type: "routes",
            },
          ],
        },
        height: 74,
        content: {
          type: "routes",
          items: [
            {
              alias: "route: empty-routes",
              type: "routes",
            },
          ],
        },
        children: [],
      },
    ],

    [
      [
        {
          alias: "custom-template: empty-custom-template",
          type: "custom-template",
        },
      ],
      "auto",
      {
        content: {
          type: "custom-template",
          items: [
            {
              alias: "custom-template: empty-custom-template",
              type: "custom-template",
            },
          ],
        },
        originalData: {
          alias: "Custom Template",
          type: "tpl-root",
          children: [
            {
              alias: "custom-template: empty-custom-template",
              type: "custom-template",
            },
          ],
        },
        height: 74,
        children: [],
        nodeType: "unknown",
      },
    ],
    [fakeBuilderGraphSource(), "auto", fakeBuilderGraphNode()],
  ])("viewsToGraph(%j, %j) should return %j", (list, wrapAnApp, result) => {
    expect(viewsToGraph(list, wrapAnApp)).toEqual(result);
  });
});

describe("getNodeDisplayName", () => {
  it.each<[ViewItem, string]>([
    [
      {
        alias: "alias-a",
      },
      "alias-a",
    ],
    [
      {
        type: "brick",
        brick: "brick-a",
      },
      "brick-a",
    ],
    [
      {
        alias: "alias-b",
        type: "brick",
        brick: "brick-a",
      },
      "alias-b",
    ],
    [
      {
        type: "brick",
        brick: "your.brick-b",
      },
      "brick-b",
    ],
    [
      {
        type: "template",
        template: "your.template-a",
      },
      "template-a",
    ],
    [
      {
        type: "routes",
        path: "/your-page-a",
      },
      "/your-page-a",
    ],
    [
      {
        type: "custom-template",
        templateId: "tpl-test",
      },
      "tpl-test",
    ],
    [
      {
        type: "view-template",
        templateId: "tpl-test",
      },
      "tpl-test",
    ],
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
          x: 10,
        },
        target: {},
      },
      10,
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "unknown",
            },
          },
          x: 10,
        },
        target: {},
      },
      10,
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "bricks",
              items: [{}, nodeA],
            },
            height: 100,
          },
          x: 10,
        },
        target: {
          data: {
            originalData: nodeA,
          },
        },
      },
      47,
    ],
    [
      {
        source: {
          data: {
            content: {
              type: "slots",
              slots: [
                {
                  items: [{}],
                },
                {
                  items: [{}, nodeA],
                },
              ],
            },
            height: 100,
          },
          x: 10,
        },
        target: {
          data: {
            originalData: nodeA,
          },
        },
      },
      133,
    ],
  ] as any)("computeSourceX(%j) should return %j", (link, x) => {
    expect(computeSourceX(link)).toBe(x);
  });
});
