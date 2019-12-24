import { filterStoryboardTree } from "./filterStoryboardTree";
import { StoryboardTree } from "./interfaces";

describe("filterStoryboardTree", () => {
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
            path: "${APP.homepage}/x"
          },
          type: "brick"
        },
        {
          brickData: {
            brick: "x.u-v"
          },
          brickType: "routed",
          groupIndex: 1,
          routeData: {
            path: "${APP.homepage}/x"
          },
          type: "brick"
        }
      ],
      type: "app"
    };

    expect(
      filterStoryboardTree(tree, {
        path: "/a"
      })
    ).toEqual({
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
        }
      ],
      type: "app"
    });

    expect(
      filterStoryboardTree(tree, {
        path: "/a/x"
      })
    ).toEqual({
      appData: {
        homepage: "/a",
        id: "a",
        name: "A"
      },
      children: [
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
            path: "${APP.homepage}/x"
          },
          type: "brick"
        },
        {
          brickData: {
            brick: "x.u-v"
          },
          brickType: "routed",
          groupIndex: 1,
          routeData: {
            path: "${APP.homepage}/x"
          },
          type: "brick"
        }
      ],
      type: "app"
    });
  });
});
