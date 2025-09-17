import {
  getRelationObjectSides,
  getDescription,
  getRelation,
  forEachAvailableFields,
  isSelfRelation,
} from "./object";
const modelData = {
  objectId: "HOST",
  name: "主机",
  attrList: [
    {
      id: "name",
      name: "名称",
    },
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
      _version: 0,
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
      _version: 0,
    },
  ],
  view: {
    hide_columns: ["_deviceList_CLUSTER"],
    trans_hier_relation_list: [
      {
        relation_id: "transHierRelation_abcjjjjjj",
        relation_name: "哈哈哈哈哈",
        display_keys: [],
        is_parent_object: true,
        object_id: "HOST",
        query_path: "artifactInsts.artifactVersion.ARTIFACT_CONTAINER",
        relation_object: "ARTIFACT_CONTAINER",
        reverse_query_path: "ARTIFACT_VERSION.artifactInsts.host",
        query: {
          fields_relation_filter: {},
          query_path: "artifactInsts.artifactVersion.ARTIFACT_CONTAINER",
          relation_object: "ARTIFACT_CONTAINER",
          reverse_query_path: "ARTIFACT_VERSION.artifactInsts.host",
        },
      },
      {
        type: "transHierRelation",
        protected: false,
        memo: "部署实例(部署实例)-所属应用服务(服务)",
        query_path: "artifactInsts.deployedServices",
        relation_object: "SERVICE@ONEMODEL",
        reverse_query_path: "relatedArtifactInst.host",
        is_inherit: true,
        relation_id: "transHierRelation_abc",
        relation_name: "部署实例(部署实例)-所属应用服务(服务)",
        display_keys: ["name", "cwd"],
        is_parent_object: true,
        object_id: "HOST",
        query: {
          fields_relation_filter: {},
          query_path: "artifactInsts.deployedServices",
          relation_object: "SERVICE@ONEMODEL",
          reverse_query_path: "relatedArtifactInst.host",
        },
      },
      {
        type: "transHierRelation",
        protected: false,
        memo: "部署实例(部署实例)-所属应用服务(服务)",
        query_path: "artifactInsts.deployedServices",
        relation_object: "SERVICE@ONEMODEL",
        reverse_query_path: "relatedArtifactInst.host",
        is_inherit: true,
        relation_id: "transHierRelation_efg",
        relation_name: "部署实例(部署实例)-所属应用服务(服务)111",
        display_keys: ["name", "cwd"],
        tags: ["基本信息"],
        is_parent_object: true,
        object_id: "HOST",
        query: {
          fields_relation_filter: {},
          query_path: "artifactInsts.deployedServices",
          relation_object: "SERVICE@ONEMODEL",
          reverse_query_path: "relatedArtifactInst.host",
        },
      },
    ],
  },
};
describe("getRelationObjectSides", () => {
  it("should work", () => {
    expect(
      getRelationObjectSides(modelData.relation_list[0], modelData)
    ).toEqual({
      this: "right",
      that: "left",
    });
    expect(
      getRelationObjectSides(modelData.relation_list[1], modelData)
    ).toEqual({
      this: "left",
      that: "right",
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
    const transHierRelationCallback = jest.fn();

    forEachAvailableFields(
      modelData,
      attrCallback,
      relationCallback,
      undefined,
      transHierRelationCallback
    );
    expect(attrCallback).toBeCalled();
    expect(relationCallback).toBeCalled();
    expect;

    forEachAvailableFields(
      modelData,
      attrCallback,
      relationCallback,
      ["name", "backupowner"],
      transHierRelationCallback
    );
    expect(attrCallback).toBeCalled();
    expect(relationCallback).toBeCalled();
    expect(transHierRelationCallback).toBeCalled();
  });
});
describe("isSelfRelation", () => {
  it("should work", () => {
    expect(
      isSelfRelation({
        left_object_id: "A",
        right_object_id: "B",
      })
    ).toBe(false);

    expect(
      isSelfRelation({
        left_object_id: "A",
        right_object_id: "A",
      })
    ).toBe(true);

    const attrCallback = jest.fn();
    const relationCallback = jest.fn();
    const _modelData = {
      ...modelData,
      relation_list: [
        ...modelData.relation_list,
        {
          left_id: "HOST_A",
          left_object_id: "HOST",
          relation_id: "HOST_SELF",
          right_id: "HOST_B",
          right_object_id: "HOST",
        },
      ],
    };

    forEachAvailableFields(_modelData, attrCallback, relationCallback);
    forEachAvailableFields(modelData, attrCallback, relationCallback, [
      "name",
      "backupowner",
    ]);
  });
});
