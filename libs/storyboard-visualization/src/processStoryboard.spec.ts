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
          children: [
            {
              brickData: {
                brick: "a.b-c"
              },
              children: undefined,
              type: "brick"
            }
          ],
          routeData: {
            path: "/a"
          },
          type: "route"
        },
        {
          children: [
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
              children: [
                {
                  children: [],
                  slotName: "a",
                  slotType: "routes",
                  type: "slot"
                },
                {
                  children: [],
                  slotName: "b",
                  slotType: "bricks",
                  type: "slot"
                }
              ],
              type: "brick"
            }
          ],
          routeData: {
            path: "/x"
          },
          type: "route"
        }
      ],
      type: "app"
    };
    expect(processStoryboard(storyboard)).toEqual(tree);
  });
});
