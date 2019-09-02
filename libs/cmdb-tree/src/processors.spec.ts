import { transformToTreeData, search } from "./processors";

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
});
