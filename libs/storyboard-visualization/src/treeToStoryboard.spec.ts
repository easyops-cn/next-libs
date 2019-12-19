import { Storyboard } from "@easyops/brick-types";
import { treeToStoryboard } from "./treeToStoryboard";
import { StoryboardTree } from "./interfaces";

describe("treeToStoryboard", () => {
  it("should work", () => {
    const storyboard: Storyboard = {
      app: {
        id: "a",
        name: "A",
        homepage: "/a"
      },
      routes: [
        {
          path: "/a",
          bricks: [
            {
              brick: "a.b-c"
            }
          ]
        },
        {
          path: "/x",
          bricks: [
            {
              brick: "x.y-z",
              slots: {
                a: {
                  type: "routes",
                  routes: [
                    {
                      path: "/y",
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
        }
      ]
    };
    const tree: StoryboardTree = {
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
            path: "/a"
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
                    path: "/y"
                  },
                  type: "brick"
                }
              ],
              groupIndex: 0,
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
            path: "/x"
          },
          type: "brick"
        }
      ],
      type: "app"
    };
    expect(treeToStoryboard(tree)).toEqual(storyboard);
  });
});
