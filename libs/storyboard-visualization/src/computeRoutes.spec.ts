import { computeRoutes } from "./computeRoutes";
import { StoryboardTree } from "./interfaces";

describe("computeRoutes", () => {
  it("should work", () => {
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
    expect(computeRoutes(tree)).toEqual(["/a", "/x"]);
  });
});
