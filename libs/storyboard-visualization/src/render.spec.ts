import { render } from "./render";
import { StoryboardTree } from "./interfaces";

describe("render", () => {
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
    const svg = render(tree);
    const containerG = Array.from(svg.children).filter(
      item => item.nodeName === "g"
    )[1];
    // links
    expect(containerG.childNodes.item(0).childNodes.length).toBe(3);
    // groups
    expect(containerG.childNodes.item(1).childNodes.length).toBe(0);
    // nodes
    expect(containerG.childNodes.item(2).childNodes.length).toBe(4);
  });
});
