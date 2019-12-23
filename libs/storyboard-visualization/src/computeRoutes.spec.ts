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
              children: [],
              groupIndex: 0,
              slotName: "a",
              type: "routes"
            }
          ],
          groupIndex: 1,
          routeData: {
            path: ["${APP.homepage}/x", "${APP.homepage}/y"]
          },
          type: "brick"
        }
      ],
      type: "app"
    };
    expect(computeRoutes(tree)).toEqual(["/a", "/a/x", "/a/y"]);
  });
});
