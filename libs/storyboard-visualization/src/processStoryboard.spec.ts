import { Storyboard } from "@easyops/brick-types";
import { processStoryboard } from "./processStoryboard";
import { StoryboardTree } from "./interfaces";

describe("processStoryboard", () => {
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
                  routes: []
                },
                b: {
                  type: "bricks",
                  bricks: []
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
            brick: "x.y-z",
            slots: {
              a: {
                routes: [],
                type: "routes"
              },
              b: {
                bricks: [],
                type: "bricks"
              }
            }
          },
          brickType: "routed",
          children: [
            {
              children: [],
              groupIndex: 0,
              slotName: "a",
              type: "routes"
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
    expect(processStoryboard(storyboard)).toEqual(tree);
  });
});
