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
    const svg = render(tree);
    const containerG = Array.from(svg.children).filter(
      item => item.nodeName === "g"
    )[1];
    expect(containerG.querySelector("g").childNodes.length).toBe(6);
    expect(containerG.querySelectorAll("g").item(1).childNodes.length).toBe(7);
  });
});
