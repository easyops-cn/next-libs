import { builderToTree, getClassNameOfNodeType } from "./processors";
import { BuilderItem, BuilderNode } from "./interfaces";
import { fakeBuilder } from "../fakesForTest";

describe("builderToTree", () => {
  it.each<[BuilderItem[], BuilderNode]>([
    [
      undefined,
      {
        nodeData: {
          alias: "APP",
          type: "app"
        },
        groupIndex: 0,
        children: []
      }
    ],
    [
      [],
      {
        nodeData: {
          alias: "APP",
          type: "app",
          children: []
        },
        groupIndex: 0,
        children: []
      }
    ],
    [
      [
        {
          alias: "r0",
          type: "routes"
        }
      ],
      {
        nodeData: {
          alias: "r0",
          type: "routes"
        },
        groupIndex: 0,
        children: []
      }
    ],
    [
      [
        {
          alias: "r1",
          type: "routes",
          children: [
            {
              alias: "r2",
              type: "brick"
            }
          ]
        }
      ],
      {
        nodeData: {
          alias: "r1",
          type: "routes",
          children: [
            {
              alias: "r2",
              type: "brick"
            }
          ]
        },
        groupIndex: 0,
        children: [
          {
            groupIndex: 0,
            nodeData: {
              alias: "r2",
              type: "brick"
            },
            children: []
          }
        ]
      }
    ],
    [
      fakeBuilder(),
      {
        nodeData: {
          alias: "b0",
          type: "brick",
          children: [
            {
              alias: "b1",
              type: "brick",
              mountPoint: "m1",
              sort: 3
            },
            {
              alias: "b2",
              type: "provider",
              mountPoint: "m2",
              sort: 0
            },
            {
              alias: "b3",
              type: "template",
              mountPoint: "m1",
              sort: 1
            }
          ]
        },
        groupIndex: 0,
        children: [
          {
            groupIndex: 0,
            nodeData: {
              alias: "b2",
              type: "provider",
              mountPoint: "m2",
              sort: 0
            },
            children: []
          },
          {
            groupIndex: 1,
            nodeData: {
              alias: "b3",
              type: "template",
              mountPoint: "m1",
              sort: 1
            },
            children: []
          },
          {
            groupIndex: 1,
            nodeData: {
              alias: "b1",
              type: "brick",
              mountPoint: "m1",
              sort: 3
            },
            children: []
          }
        ]
      }
    ]
  ])("builderToTree(%j) should return %j", (list, result) => {
    expect(builderToTree(list)).toEqual(result);
  });
});

describe("getClassNameOfNodeType", () => {
  it.each<[string, string]>([
    ["brick", "brick"],
    ["not-exists", "node-type-unknown"]
  ])("getClassNameOfNodeType(%j) should return %j", (type, result) => {
    expect(getClassNameOfNodeType(type)).toEqual(result);
  });
});
