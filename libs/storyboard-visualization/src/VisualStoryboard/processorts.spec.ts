import {
  brickNodeChildrenToSlots,
  updateBrickNode,
  routesNodeChildrenToRoutes,
  updateRoutesNode
} from "./processors";
import {
  StoryboardNodeBrickChild,
  StoryboardNodeBrick,
  StoryboardNodeRoutedBrick,
  StoryboardNodeApp,
  StoryboardNodeSlottedRoutes
} from "../interfaces";

describe("brickNodeChildrenToSlots", () => {
  it("should work", () => {
    const nodes: Partial<StoryboardNodeBrickChild>[] = [
      {
        groupIndex: 0,
        type: "routes",
        slotName: "content"
      },
      {
        groupIndex: 0,
        type: "routes",
        slotName: "content"
      },
      {
        groupIndex: 1,
        type: "brick",
        slotName: "subMenu"
      }
    ];
    expect(brickNodeChildrenToSlots(nodes as any)).toEqual({
      content: {
        type: "routes"
      },
      subMenu: {
        type: "bricks"
      }
    });
  });
});

describe("updateBrickNode", () => {
  it("should work", () => {
    const node: Partial<StoryboardNodeBrick> = {
      brickData: {
        template: "a.b",
        params: {}
      },
      children: [
        {
          groupIndex: 0,
          type: "routes",
          slotName: "content"
        },
        {
          groupIndex: 0,
          type: "routes",
          slotName: "content"
        },
        {
          groupIndex: 0,
          type: "brick",
          slotName: "subMenu"
        }
      ] as any[]
    };
    updateBrickNode(node as any, {
      brick: "x.y",
      properties: {},
      slots: {
        content: {
          type: "routes"
        },
        toolbar: {
          type: "bricks"
        },
        subMenu: {
          type: "bricks"
        },
        footer: {
          type: "routes"
        }
      }
    });
    expect(node).toMatchInlineSnapshot(`
      Object {
        "brickData": Object {
          "brick": "x.y",
          "properties": Object {},
        },
        "children": Array [
          Object {
            "groupIndex": 0,
            "slotName": "content",
            "type": "routes",
          },
          Object {
            "groupIndex": 0,
            "slotName": "content",
            "type": "routes",
          },
          Object {
            "brickData": Object {
              "brick": "div",
              "injectDeep": true,
            },
            "brickType": "slotted",
            "groupIndex": 1,
            "slotName": "toolbar",
            "type": "brick",
          },
          Object {
            "groupIndex": 2,
            "slotName": "subMenu",
            "type": "brick",
          },
          Object {
            "children": Array [],
            "groupIndex": 3,
            "slotName": "footer",
            "type": "routes",
          },
        ],
      }
    `);
  });
});

describe("routesNodeChildrenToRoutes", () => {
  it("should work", () => {
    const nodes: Partial<StoryboardNodeRoutedBrick>[] = [
      {
        groupIndex: 0,
        routeData: {
          path: "/"
        }
      },
      {
        groupIndex: 0,
        routeData: {
          path: "/"
        }
      },
      {
        groupIndex: 1,
        routeData: {
          path: "/a"
        }
      }
    ];
    expect(routesNodeChildrenToRoutes(nodes as any)).toEqual([
      {
        _target: 0,
        path: "/"
      },
      {
        _target: 1,
        path: "/a"
      }
    ]);
  });
});

describe("updateRoutesNode", () => {
  it("should work", () => {
    const node: Partial<StoryboardNodeApp | StoryboardNodeSlottedRoutes> = {
      children: [
        {
          groupIndex: 0,
          type: "brick"
        },
        {
          groupIndex: 0,
          type: "brick"
        },
        {
          groupIndex: 1,
          type: "brick"
        },
        {
          groupIndex: 2,
          type: "brick"
        }
      ] as any[]
    };
    updateRoutesNode(node as any, {
      routes: [
        {
          _target: 0,
          path: "/a"
        },
        {
          path: "/x"
        },
        {
          _target: 1,
          path: "/b"
        }
      ]
    });
    expect(node).toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "groupIndex": 0,
            "routeData": Object {
              "path": "/a",
            },
            "type": "brick",
          },
          Object {
            "groupIndex": 0,
            "routeData": Object {
              "path": "/a",
            },
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "brick": "div",
              "injectDeep": true,
            },
            "brickType": "routed",
            "groupIndex": 1,
            "routeData": Object {
              "path": "/x",
            },
            "type": "brick",
          },
          Object {
            "groupIndex": 2,
            "routeData": Object {
              "path": "/b",
            },
            "type": "brick",
          },
        ],
      }
    `);
  });
});
