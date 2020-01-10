import { CmdbModels } from "@sdk/cmdb-sdk";
import {
  transformToTreeData,
  search,
  getRelation2ObjectId,
  updateChildren
} from "./processors";

const objectList = [
  {
    category: "",
    objectId: "HELLO",
    name: "hello"
  },
  {
    category: "基础设施.F5",
    objectId: "iRoute",
    name: "iRoute"
  },
  {
    category: "应用资源",
    objectId: "BUSINESS",
    name: "业务"
  },
  {
    category: "应用资源",
    objectId: "APP",
    name: "应用"
  },
  {
    category: "应用资源.部署资源",
    objectId: "RESOURCE_GROUP",
    name: "部署资源组"
  },
  {
    category: "others.foo",
    objectId: "OTHERS",
    name: "others"
  },
  {
    category: "others.foo",
    objectId: "xOTHERS",
    name: "others"
  }
];

describe("transformToTreeData", () => {
  it("transformToTreeData should work", () => {
    const result = transformToTreeData(objectList);
    expect(result).toMatchSnapshot();
  });

  it("search should work", () => {
    const treeData = [
      {
        key: "id-1",
        title: "name-1",
        children: [
          { key: "id-1-1", title: "name-1-1" },
          { key: "id-1-2", title: "name-1-2" },
          { key: "id-1-3", title: "name-1-3" }
        ]
      },
      { key: "id-2", title: "name-2" },
      { key: "id-3", title: "name-3" }
    ];

    let result = search(treeData, "id-1-3");
    expect(result).toEqual([
      {
        key: "id-1",
        title: "name-1",
        children: [{ key: "id-1-3", title: "name-1-3" }]
      }
    ]);

    result = search(treeData, "name-1-2");
    expect(result).toEqual([
      {
        key: "id-1",
        title: "name-1",
        children: [{ key: "id-1-2", title: "name-1-2" }]
      }
    ]);

    expect(search(treeData, "xxx").length).toBe(0);

    result = search(treeData, "name-1");
    expect(result[0]).toEqual(treeData[0]);
  });

  it("getObjectIds should work", () => {
    const objectList: any = [
      {
        objectId: "BUSINESS",
        relation_list: [
          {
            left_id: "businesses",
            left_object_id: "APP",
            right_id: "_businesses_APP",
            right_object_id: "BUSINESS"
          },
          {
            left_id: "_sub_system",
            left_object_id: "BUSINESS",
            right_id: "_parent_system",
            right_object_id: "BUSINESS"
          }
        ]
      },
      {
        objectId: "APP",
        relation_list: []
      }
    ];
    const request: CmdbModels.ModelInstanceTreeRootNode = {
      object_id: "BUSINESS",
      query: {},
      fields: { name: true },
      child: [
        {
          relation_field_id: "_sub_system"
        },
        {
          relation_field_id: "x",
          child: [
            {
              relation_field_id: "z"
            }
          ]
        },
        {
          relation_field_id: "_businesses_APP"
        }
      ]
    };
    const map = getRelation2ObjectId(objectList, request);
    expect(map.get("_sub_system")).toBe("BUSINESS");
    expect(map.get("_businesses_APP")).toBe("BUSINESS");
  });

  it("updateChildren should work", () => {
    const treeData: any = [
      {
        key: "id-1",
        children: [
          {
            key: "id-1-1"
          }
        ]
      },
      {
        key: "id-2",
        children: [
          {
            key: "id-1-1"
          }
        ]
      },
      {
        key: "id-3"
      }
    ];
    const nodes = [];
    updateChildren("id-1-1", treeData, nodes);
    expect(treeData[0].children[0].children).toEqual([]);
    expect(treeData[1].children[0].children).toEqual([]);
  });
});
