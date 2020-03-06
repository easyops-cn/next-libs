import { Storyboard } from "@easyops/brick-types";
import { StoryboardTree } from "./interfaces";
import { BuilderItem } from "./Builder";

export function fakeStoryboard(): Storyboard {
  return {
    app: {
      id: "a",
      name: "A",
      homepage: "/a"
    },
    routes: [
      {
        path: "${APP.homepage}",
        exact: true,
        bricks: [
          {
            brick: "a.b-c"
          }
        ]
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
                        brick: "x.y-a"
                      }
                    ]
                  }
                ]
              },
              b: {
                type: "bricks",
                bricks: [
                  {
                    brick: "x.y-b"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        path: "${APP.homepage}/r",
        type: "routes",
        routes: [
          {
            path: "${APP.homepage}/r/o",
            bricks: [
              {
                brick: "x.y-c"
              }
            ]
          }
        ]
      },
      {
        path: "${APP.homepage}/m",
        redirect: "${APP.homepage}/n"
      }
    ]
  };
}

export function fakeTree(): StoryboardTree {
  return {
    appData: {
      homepage: "/a",
      id: "a",
      name: "A"
    },
    children: [
      {
        brickData: {
          brick: "a.b-c"
        },
        brickType: "routed",
        children: undefined,
        groupIndex: 0,
        routeData: {
          path: "${APP.homepage}",
          exact: true
        },
        type: "brick"
      },
      {
        brickData: {
          brick: "x.y-z"
        },
        brickType: "routed",
        children: [
          {
            children: [
              {
                brickData: {
                  brick: "x.y-a"
                },
                brickType: "routed",
                children: undefined,
                groupIndex: 0,
                routeData: {
                  path: "${APP.homepage}/x/y"
                },
                type: "brick"
              }
            ],
            groupIndex: 0,
            routeType: "slotted",
            slotName: "a",
            type: "routes"
          },
          {
            brickData: {
              brick: "x.y-b"
            },
            brickType: "slotted",
            children: undefined,
            groupIndex: 1,
            slotName: "b",
            type: "brick"
          }
        ],
        groupIndex: 1,
        routeData: {
          path: "${APP.homepage}/x"
        },
        type: "brick"
      },
      {
        children: [
          {
            brickData: {
              brick: "x.y-c"
            },
            brickType: "routed",
            children: undefined,
            groupIndex: 0,
            routeData: {
              path: "${APP.homepage}/r/o"
            },
            type: "brick"
          }
        ],
        groupIndex: 2,
        routeData: {
          path: "${APP.homepage}/r"
        },
        routeType: "routed",
        type: "routes"
      },
      {
        groupIndex: 3,
        routeData: {
          path: "${APP.homepage}/m",
          redirect: "${APP.homepage}/n"
        },
        type: "redirect"
      }
    ],
    type: "app"
  };
}

export function fakeBuilder(): BuilderItem[] {
  return [
    {
      alias: "b0",
      type: "brick",
      children: [
        {
          alias: "b1",
          type: "brick",
          mountPoint: "m1",
          sort: 3
        },
        {
          alias: "b2",
          type: "provider",
          mountPoint: "m2",
          sort: 0
        },
        {
          alias: "b3",
          type: "template",
          mountPoint: "m1",
          sort: 1
        }
      ]
    }
  ];
}
