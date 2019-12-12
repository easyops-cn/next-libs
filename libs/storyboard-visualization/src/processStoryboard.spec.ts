import { Storyboard } from "@easyops/brick-types";
import { processStoryboard } from "./processStoryboard";

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
    expect(processStoryboard(storyboard)).toMatchInlineSnapshot(`
      Object {
        "appData": Object {
          "homepage": "/a",
          "id": "a",
          "name": "A",
        },
        "children": Array [
          Object {
            "children": Array [
              Object {
                "brickData": Object {
                  "brick": "a.b-c",
                },
                "children": undefined,
                "type": "brick",
              },
            ],
            "routeData": Object {
              "path": "/a",
            },
            "type": "route",
          },
          Object {
            "children": Array [
              Object {
                "brickData": Object {
                  "brick": "x.y-z",
                  "slots": Object {
                    "a": Object {
                      "routes": Array [],
                      "type": "routes",
                    },
                    "b": Object {
                      "bricks": Array [],
                      "type": "bricks",
                    },
                  },
                },
                "children": Array [
                  Object {
                    "children": Array [],
                    "slotName": "a",
                    "slotType": "routes",
                    "type": "slot",
                  },
                  Object {
                    "children": Array [],
                    "slotName": "b",
                    "slotType": "bricks",
                    "type": "slot",
                  },
                ],
                "type": "brick",
              },
            ],
            "routeData": Object {
              "path": "/x",
            },
            "type": "route",
          },
        ],
        "type": "app",
      }
    `);
  });
});
