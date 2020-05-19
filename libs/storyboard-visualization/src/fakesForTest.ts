import { Storyboard } from "@easyops/brick-types";
import { StoryboardTree } from "./interfaces";
import { GraphNode } from "./BuilderGraph";
import { RouteGraphNode } from "./RoutesGraph";
import { ViewItem } from "./shared/interfaces";
import { ContentItemActions } from "@libs/basic-components";

export function fakeStoryboard(): Storyboard {
  return {
    app: {
      id: "a",
      name: "A",
      homepage: "/a",
    },
    routes: [
      {
        path: "${APP.homepage}",
        exact: true,
        bricks: [
          {
            brick: "a.b-c",
          },
        ],
      },
      {
        path: "${APP.homepage}/x",
        bricks: [
          {
            brick: "x.y-z",
            slots: {
              a: {
                type: "routes",
                routes: [
                  {
                    path: "${APP.homepage}/x/y",
                    bricks: [
                      {
                        brick: "x.y-a",
                      },
                    ],
                  },
                ],
              },
              b: {
                type: "bricks",
                bricks: [
                  {
                    brick: "x.y-b",
                  },
                ],
              },
            },
          },
        ],
      },
      {
        path: "${APP.homepage}/r",
        type: "routes",
        routes: [
          {
            path: "${APP.homepage}/r/o",
            bricks: [
              {
                brick: "x.y-c",
              },
            ],
          },
        ],
      },
      {
        path: "${APP.homepage}/m",
        redirect: "${APP.homepage}/n",
      },
    ],
  };
}

export function fakeTree(): StoryboardTree {
  return {
    appData: {
      homepage: "/a",
      id: "a",
      name: "A",
    },
    children: [
      {
        brickData: {
          brick: "a.b-c",
        },
        brickType: "routed",
        children: undefined,
        groupIndex: 0,
        routeData: {
          path: "${APP.homepage}",
          exact: true,
        },
        type: "brick",
      },
      {
        brickData: {
          brick: "x.y-z",
        },
        brickType: "routed",
        children: [
          {
            children: [
              {
                brickData: {
                  brick: "x.y-a",
                },
                brickType: "routed",
                children: undefined,
                groupIndex: 0,
                routeData: {
                  path: "${APP.homepage}/x/y",
                },
                type: "brick",
              },
            ],
            groupIndex: 0,
            routeType: "slotted",
            slotName: "a",
            type: "routes",
          },
          {
            brickData: {
              brick: "x.y-b",
            },
            brickType: "slotted",
            children: undefined,
            groupIndex: 1,
            slotName: "b",
            type: "brick",
          },
        ],
        groupIndex: 1,
        routeData: {
          path: "${APP.homepage}/x",
        },
        type: "brick",
      },
      {
        children: [
          {
            brickData: {
              brick: "x.y-c",
            },
            brickType: "routed",
            children: undefined,
            groupIndex: 0,
            routeData: {
              path: "${APP.homepage}/r/o",
            },
            type: "brick",
          },
        ],
        groupIndex: 2,
        routeData: {
          path: "${APP.homepage}/r",
        },
        routeType: "routed",
        type: "routes",
      },
      {
        groupIndex: 3,
        routeData: {
          path: "${APP.homepage}/m",
          redirect: "${APP.homepage}/n",
        },
        type: "redirect",
      },
    ],
    type: "app",
  };
}

export function fakeBuilderGraphSource(): ViewItem[] {
  return [
    {
      alias: "brick: 2",
      type: "brick",
      children: [
        {
          alias: "brick: 3",
          type: "brick",
          mountPoint: "m1",
          sort: 3,
          children: [
            {
              alias: "brick: 4",
              type: "brick",
              mountPoint: "m11",
            },
          ],
        },
        {
          alias: "provider: 1",
          type: "provider",
          mountPoint: "m2",
        },
        {
          alias: "template: 1",
          type: "template",
          mountPoint: "m1",
          sort: 1,
        },
      ],
    },
  ];
}

export function fakeBuilderGraphNode(): GraphNode {
  return {
    nodeType: "brick",
    content: {
      type: "slots",
      slots: [
        {
          name: "m2",
          type: "bricks",
          items: [
            {
              alias: "provider: 1",
              type: "provider",
              mountPoint: "m2",
            },
          ],
        },
        {
          name: "m1",
          type: "bricks",
          items: [
            {
              alias: "template: 1",
              type: "template",
              mountPoint: "m1",
              sort: 1,
            },
            {
              alias: "brick: 3",
              type: "brick",
              mountPoint: "m1",
              sort: 3,
              children: [
                {
                  alias: "brick: 4",
                  type: "brick",
                  mountPoint: "m11",
                },
              ],
            },
          ],
        },
      ],
    },
    originalData: {
      alias: "brick: 2",
      type: "brick",
      children: [
        {
          alias: "brick: 3",
          type: "brick",
          mountPoint: "m1",
          sort: 3,
          children: [
            {
              alias: "brick: 4",
              type: "brick",
              mountPoint: "m11",
            },
          ],
        },
        {
          alias: "provider: 1",
          type: "provider",
          mountPoint: "m2",
        },
        {
          alias: "template: 1",
          type: "template",
          mountPoint: "m1",
          sort: 1,
        },
      ],
    },
    height: 195,
    children: [
      {
        nodeType: "brick",
        content: {
          type: "slots",
          slots: [
            {
              name: "m11",
              type: "bricks",
              items: [
                {
                  alias: "brick: 4",
                  type: "brick",
                  mountPoint: "m11",
                },
              ],
            },
          ],
        },
        originalData: {
          alias: "brick: 3",
          type: "brick",
          mountPoint: "m1",
          sort: 3,
          children: [
            {
              alias: "brick: 4",
              type: "brick",
              mountPoint: "m11",
            },
          ],
        },
        height: 98,
        children: [],
      },
    ],
  };
}

export function fakeRoutesGraphNodes(): RouteGraphNode[] {
  return [
    {
      originalData: {
        alias: "/list",
        appId: "next-builder-dev",
        id: "B-3712",
        path: "${APP.homepage}/list",
        type: "bricks",
        graphInfo: {
          x: 100,
          y: 100,
        },
      },
      nodeConfig: {
        width: 121,
        height: 160,
      },
    },
    {
      originalData: {
        alias: "/create",
        appId: "next-builder-dev",
        id: "B-3721",
        path: "${APP.homepage}/create",
        type: "routes",
        graphInfo: {
          x: 300,
          y: 300,
        },
        segues: {
          "go-to-list": {
            target: "/list",
          },
          "go-to-detail": {
            target: "/detail",
          },
        },
      },
      nodeConfig: {
        width: 121,
        height: 160,
      },
    },
    {
      originalData: {
        alias: "${APP.homepage}",
        appId: "next-builder-dev",
        id: "B-3884",
        path: "${APP.homepage}",
        type: "bricks",
      },
      nodeConfig: {
        width: 121,
        height: 160,
      },
    },
  ];
}

export function fakeContentItemActions(): ContentItemActions {
  return {
    useBrick: [
      {
        brick: "div",
        properties: {
          textContent: "Add View",
        },
        if: "@{item.type|equal:bricks}",
      },
      {
        brick: "div",
        properties: {
          textContent: "Edit Route",
        },
      },
    ],
  };
}
