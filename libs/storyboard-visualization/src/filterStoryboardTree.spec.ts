import { filterStoryboardTree } from "./filterStoryboardTree";
import { StoryboardTree, AbstractStoryboardNode } from "./interfaces";

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

    const filteredTree1 = filterStoryboardTree(tree, {
      path: "/a"
    });
    expect(filteredTree1.appData).toBe(tree.appData);
    expect(filteredTree1.children.length).toBe(1);
    expect(filteredTree1.children[0]).toBe(tree.children[0]);

    const filteredTree2 = filterStoryboardTree(tree, {
      path: "/a/x"
    });
    expect(filteredTree2.appData).toBe(tree.appData);
    expect(filteredTree2.children.length).toBe(2);
    expect(filteredTree2.children[0]).toMatchObject(tree.children[1]);
    expect(filteredTree2.children[1]).toMatchObject(tree.children[2]);
  });
});
