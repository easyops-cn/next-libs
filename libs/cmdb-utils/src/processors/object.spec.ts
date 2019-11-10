import {
  getRelationObjectSides,
  getDescription,
  getRelation,
  forEachAvailableFields
} from "./object";
const modelData = {
  objectId: "HOST",
  name: "主机",
  attrList: [
    {
      id: "name",
      name: "名称"
    }
  ],
  relation_list: [
    {
      relation_id: "CLUSTER_deviceList_HOST",
      name: "",
      protected: false,
      left_object_id: "CLUSTER",
      left_id: "deviceList",
      left_description: "所属集群",
      left_name: "主机",
      left_min: 0,
      left_max: -1,
      left_groups: ["_relate_connect"],
      left_tags: [],
      right_object_id: "HOST",
      right_id: "_deviceList_CLUSTER",
      right_description: "主机",
      right_name: "所属集群",
      right_min: 0,
      right_max: -1,
      right_groups: [],
      right_tags: [],
      _version: 0
    },
    {
      left_description: "负责备份的主机",
      left_groups: ["_user", "basic_info"],
      left_id: "backupowner",
      left_max: -1,
      left_min: 0,
      left_name: "备份负责人",
      left_object_id: "HOST",
      left_tags: [],
      name: "",
      protected: false,
      relation_id: "HOST_backupowner_USER",
      right_description: "备份负责人",
      right_groups: [],
      right_id: "_backupowner_HOST",
      right_max: -1,
      right_min: 0,
      right_name: "负责备份的主机",
      right_object_id: "USER",
      right_tags: [],
      _version: 0
    }
  ],
  view: {
    hide_columns: ["_deviceList_CLUSTER"]
  }
};
describe("getRelationObjectSides", () => {
  it("should work", () => {
    expect(
      getRelationObjectSides(modelData.relation_list[0], modelData)
    ).toEqual({
      this: "right",
      that: "left"
    });
    expect(
      getRelationObjectSides(modelData.relation_list[1], modelData)
    ).toEqual({
      this: "left",
      that: "right"
    });
  });
});
describe("getRelation", () => {
  it("should work", () => {
    expect(getRelation(modelData, "_deviceList_CLUSTER")).toEqual(
      modelData.relation_list[0]
    );
    expect(getRelation(modelData, "backupowner")).toEqual(
      modelData.relation_list[1]
    );
  });
});
describe("getDescription", () => {
  it("should work", () => {
    expect(getDescription(modelData.relation_list[0], modelData)).toEqual(
      "所属集群"
    );
    expect(getDescription(modelData.relation_list[1], modelData)).toEqual(
      "备份负责人"
    );
  });
});
describe("forEachAvailableFields", () => {
  it("should work", () => {
    const attrCallback = jest.fn();
    const relationCallback = jest.fn();

    forEachAvailableFields(modelData, attrCallback, relationCallback);
    expect(attrCallback).toBeCalled();
    expect(relationCallback).toBeCalled();

    forEachAvailableFields(modelData, attrCallback, relationCallback, [
      "name",
      "backupowner"
    ]);
    expect(attrCallback).toBeCalled();
    expect(relationCallback).toBeCalled();
  });
});
