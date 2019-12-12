import { Storyboard } from "@easyops/brick-types";
import { render } from "./render";
import { processStoryboard } from "./processStoryboard";

describe("render", () => {
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
    const svg = render(processStoryboard(storyboard));
    const containerG = svg.querySelector("g");
    expect(containerG.querySelector("g").childNodes.length).toBe(6);
    expect(containerG.querySelectorAll("g").item(1).childNodes.length).toBe(7);
  });
});
