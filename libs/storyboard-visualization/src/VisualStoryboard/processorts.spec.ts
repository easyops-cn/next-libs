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
        slotName: "subMenu",
        brickData: {
          brick: "sub-menu"
        }
      }
    ];
    expect(brickNodeChildrenToSlots(nodes as any)).toEqual({
      content: {
        type: "routes"
      },
      subMenu: {
        type: "bricks",
        bricks: [
          {
            _target: 0,
            brick: "sub-menu",
            template: undefined
          }
        ]
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
          groupIndex: 1,
          type: "brick",
          slotName: "subMenu",
          brickData: {
            brick: "sub-menu",
            properties: {}
          }
        },
        {
          groupIndex: 1,
          type: "brick",
          slotName: "subMenu",
          brickData: {
            brick: "sub-menu-second",
            properties: {}
          }
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
          type: "bricks",
          bricks: [
            {
              brick: "page-title"
            },
            {
              _target: 0,
              template: "sub-menu-template"
            },
            {
              _target: 1,
              brick: "sub-menu-third"
            }
          ]
        },
        more: {
          type: "bricks",
          bricks: [
            {},
            { brick: "show-more" },
            { template: "show-more-template" }
          ]
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
            },
            "brickType": "slotted",
            "groupIndex": 1,
            "slotName": "toolbar",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "brick": "page-title",
            },
            "brickType": "slotted",
            "groupIndex": 2,
            "slotName": "subMenu",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "if": undefined,
              "internalUsedBricks": undefined,
              "internalUsedTemplates": undefined,
              "template": "sub-menu-template",
            },
            "groupIndex": 2,
            "slotName": "subMenu",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "brick": "sub-menu-third",
              "if": undefined,
              "internalUsedBricks": undefined,
              "internalUsedTemplates": undefined,
              "properties": Object {},
            },
            "groupIndex": 2,
            "slotName": "subMenu",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "brick": "div",
            },
            "brickType": "slotted",
            "groupIndex": 3,
            "slotName": "more",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "brick": "show-more",
            },
            "brickType": "slotted",
            "groupIndex": 3,
            "slotName": "more",
            "type": "brick",
          },
          Object {
            "brickData": Object {
              "template": "show-more-template",
            },
            "brickType": "slotted",
            "groupIndex": 3,
            "slotName": "more",
            "type": "brick",
          },
          Object {
            "children": Array [],
            "groupIndex": 4,
            "routeType": "slotted",
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
        },
        {
          path: "/c",
          type: "routes"
        },
        {
          path: "/m",
          type: "redirect",
          redirect: "/n"
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
    Object {
      "children": Array [],
      "groupIndex": 3,
      "routeData": Object {
        "path": "/c",
      },
      "routeType": "routed",
      "type": "routes",
    },
    Object {
      "groupIndex": 4,
      "routeData": Object {
        "path": "/m",
        "redirect": "/n",
      },
      "type": "redirect",
    },
  ],
}
`);
  });
});
