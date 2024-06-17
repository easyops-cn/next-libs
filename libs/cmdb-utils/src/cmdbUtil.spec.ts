import { cloneDeep } from "lodash";
import {
  composeInstanceShowName,
  getInstanceShowName,
  getInstanceNameKey,
  getInstanceName,
  getBatchEditableAttributes,
  getBatchEditableRelations,
  composeErrorMessage,
  getRelationQuery,
  modifyModelData,
  getFixedStyle,
  getBatchEditableFields,
  treeEnumFormat,
  nodeData,
} from "./cmdbUtil";

describe("util", () => {
  it("get show name", () => {
    expect(composeInstanceShowName(["1.1.1.1", "hostname1"])).toEqual(
      "1.1.1.1(hostname1)"
    );
    expect(composeInstanceShowName(["1.1.1.1"])).toEqual("1.1.1.1");
    expect(composeInstanceShowName(["1.1.1.1", ""])).toEqual("1.1.1.1");
    expect(composeInstanceShowName(["1.1.1.1", undefined])).toEqual("1.1.1.1");
    expect(composeInstanceShowName(["", "1.1.1.1"])).toEqual("1.1.1.1");
    expect(composeInstanceShowName([undefined, "1.1.1.1"])).toEqual("1.1.1.1");
  });

  it("get show name when name is too long", () => {
    expect(composeInstanceShowName(["1.1.1.1", "hostname1"], 0)).toEqual(
      "1.1.1.1(hostname1)"
    );
    expect(composeInstanceShowName(["1.1.1.1", "hostname1"], 15)).toEqual(
      "1.1.1.1(host..."
    );
    expect(composeInstanceShowName(["1.1.1.1"], 7)).toEqual("1.1.1.1");
    expect(composeInstanceShowName(["aaaaaaaa"], 5)).toEqual("aa...");
  });

  it("get show name by instanceData and showKey", () => {
    expect(getInstanceShowName({ host: "1.1.1.1" }, ["host"])).toEqual(
      "1.1.1.1"
    );
  });

  it("should get instanceNamekey by objectId", () => {
    expect(getInstanceNameKey("HOST")).toBe("hostname");
    expect(getInstanceNameKey("APP")).toBe("name");
  });
  it("should getInstanceName", () => {
    expect(getInstanceName({ name: "name", hostname: "hostname" })).toBe(
      "name"
    );
    expect(
      getInstanceName({ name: "test", hostname: "hostname" }, "HOST")
    ).toBe("hostname");
  });
  it("should getBatchEditableAttributes by modelData", () => {
    const modelData = {
      category: "应用资源",
      creator: "anonymous",
      modifier: "defaultUser",
      name: "OS镜像",
      objectId: "IMAGE",
      attrList: [
        {
          id: "name",
          readonly: "false",
          unique: "false",
        },
        {
          id: "label",
          readonly: "false",
          unique: "true",
        },
        {
          id: "title",
          readonly: "true",
          unique: "false",
        },
      ],
    };
    expect(getBatchEditableAttributes(modelData)).toEqual([
      {
        id: "name",
        readonly: "false",
        unique: "false",
      },
    ]);
  });

  it("should getBatchEditableRelations by modelData", () => {
    const modelData = {
      name: "主机",
      objectId: "HOST",
      attrList: [
        {
          id: "label",
          readonly: "false",
          unique: "true",
          isRelation: false,
        },
      ],
      relation_list: [
        {
          relation_id: "_deviceList_CLUSTER",
          left_description: "所属集群",
          left_id: "deviceList",
          left_object_id: "CLUSTER",
          right_id: "_deviceList_CLUSTER_HOST",
          right_object_id: "HOST",
          right_description: "主机",
        },
        {
          relation_id: "_owner_HOST",
          left_description: "负责运维的主机",
          left_id: "owner",
          left_object_id: "HOST",
          right_id: "HOST_owner_USER",
          right_object_id: "USER",
          right_description: "运维负责人",
        },
        {
          left_description: "宿主机",
          left_id: "LOGICAL_HOST",
          left_name: "虚拟机",
          left_object_id: "HOST",
          right_description: "虚拟机",
          right_id: "PHYSICAL_HOST",
          right_name: "宿主机",
          right_object_id: "HOST",
        },
      ],
      view: {
        attr_order: ["label"],
      },
    };
    expect(getBatchEditableRelations(modelData)).toEqual([
      {
        __id: "_deviceList_CLUSTER_HOST",
        __inverted: true,
        __isRelation: true,
        id: "_deviceList_CLUSTER_HOST",
        isRelation: true,
        left_description: "主机",
        left_id: "_deviceList_CLUSTER_HOST",
        left_object_id: "HOST",
        name: "所属集群",
        objectId: "CLUSTER",
        relation_id: "_deviceList_CLUSTER",
        right_description: "所属集群",
        right_id: "deviceList",
        right_object_id: "CLUSTER",
      },
      {
        __id: "owner",
        __inverted: false,
        __isRelation: true,
        id: "owner",
        isRelation: true,
        left_description: "负责运维的主机",
        left_id: "owner",
        left_object_id: "HOST",
        name: "运维负责人",
        objectId: "USER",
        relation_id: "_owner_HOST",
        right_description: "运维负责人",
        right_id: "HOST_owner_USER",
        right_object_id: "USER",
      },
      {
        __id: "LOGICAL_HOST",
        __inverted: false,
        __isRelation: true,
        id: "LOGICAL_HOST",
        isRelation: true,
        left_description: "宿主机",
        left_id: "LOGICAL_HOST",
        left_name: "虚拟机",
        left_object_id: "HOST",
        name: "虚拟机",
        objectId: "HOST",
        right_description: "虚拟机",
        right_id: "PHYSICAL_HOST",
        right_name: "宿主机",
        right_object_id: "HOST",
      },
      {
        __id: "PHYSICAL_HOST",
        __inverted: true,
        __isRelation: true,
        id: "PHYSICAL_HOST",
        isRelation: true,
        left_description: "虚拟机",
        left_id: "PHYSICAL_HOST",
        left_name: "宿主机",
        left_object_id: "HOST",
        name: "宿主机",
        objectId: "HOST",
        right_description: "宿主机",
        right_id: "LOGICAL_HOST",
        right_name: "虚拟机",
        right_object_id: "HOST",
      },
    ]);
  });
  it("should work with getRelationQuery", () => {
    const relation1 = {
      relation_id: "_deviceList_CLUSTER",
      left_description: "所属集群",
      left_id: "deviceList",
      left_object_id: "CLUSTER",
      right_id: "_deviceList_CLUSTER_HOST",
      right_object_id: "HOST",
      right_description: "主机",
    };
    expect(getRelationQuery("123", relation1, false, "$eq")).toEqual({
      "deviceList.instanceId": { $eq: "123" },
    });
    expect(getRelationQuery(["123", "456"], relation1, false)).toEqual({
      "deviceList.instanceId": { $in: ["123", "456"] },
    });
    expect(getRelationQuery(["123", "456"], relation1, true)).toEqual({
      "_deviceList_CLUSTER_HOST.instanceId": { $in: ["123", "456"] },
    });
  });
  it("should work with composeErrorMessage", () => {
    const failedList = [
      {
        instanceId: "1",
        hostname: "1",
      },
    ];
    const context = {
      modelData: {
        name: "主机",
      },
      nameKey: "hostname",
    };

    let errorData = {
      update_count: 0,
      failed_count: 1,
      data: [
        {
          error: "找不到实例",
          data: [
            {
              instanceId: "1",
            },
          ],
        },
      ],
    };
    expect(composeErrorMessage(errorData, failedList, context)).toEqual(
      "批量编辑主机失败（找不到实例：1）。"
    );

    errorData = {
      update_count: 1,
      failed_count: 1,
      data: [
        {
          error: "找不到实例",
          data: [
            {
              instanceId: "1",
            },
          ],
        },
      ],
    };
    expect(composeErrorMessage(errorData, failedList, context)).toEqual(
      "批量编辑主机部分失败，其中 1 个成功，1 个失败（找不到实例：1）。"
    );
  });

  const clusterObjectData = {
    objectId: "CLUSTER",
    name: "集群",
    attrList: [
      {
        id: "name",
        name: "名称",
      },
      {
        id: "type",
        name: "集群类型",
      },
      {
        id: "packageId",
      },
    ],
    relation_list: [
      {
        relation_id: "APP_clusters_CLUSTER",
        left_object_id: "APP",
        left_id: "clusters",
        left_name: "集群",
        left_description: "所属应用",
        left_min: 0,
        left_max: -1,
        left_groups: [],
        left_tags: [],
        right_object_id: "CLUSTER",
        right_id: "appId",
        right_name: "所属应用",
        right_description: "集群",
        right_min: 0,
        right_max: 1,
        right_groups: [],
        right_tags: [],
      },
      {
        relation_id: "CLUSTER_deviceList_HOST",
        left_object_id: "CLUSTER",
        left_id: "deviceList",
        left_name: "主机",
        left_description: "所属集群",
        left_min: 0,
        left_max: -1,
        left_groups: ["basic_info"],
        left_tags: [],
        right_object_id: "HOST",
        right_id: "_deviceList_CLUSTER",
        right_name: "所属集群",
        right_description: "主机",
        right_min: 0,
        right_max: 1,
        right_groups: [],
        right_tags: [],
      },
    ],
    view: {
      attr_order: ["name", "deviceList", "notExistedAttrId"],
    },
  };

  it("should modify objectDataList without attr_order correctly", () => {
    const clusterObjectDataWithoutAttrOrder = cloneDeep(clusterObjectData);
    clusterObjectDataWithoutAttrOrder.view.attr_order = undefined;
    const modifiedClusterObjectData = modifyModelData(
      clusterObjectDataWithoutAttrOrder
    );

    const ids = modifiedClusterObjectData.__fieldList.map(
      (field) => field.__id
    );
    expect(ids).toEqual(["name", "type", "appId", "deviceList"]);
  });

  it("should modify objectDataList correctly", () => {
    const modifiedClusterObjectData = modifyModelData(clusterObjectData);

    expect(modifiedClusterObjectData.__fieldList).toEqual([
      {
        id: "name",
        name: "名称",
        __id: "name",
        __isRelation: false,
      },
      {
        relation_id: "CLUSTER_deviceList_HOST",
        left_object_id: "CLUSTER",
        left_id: "deviceList",
        left_name: "主机",
        left_description: "所属集群",
        left_min: 0,
        left_max: -1,
        left_groups: ["basic_info"],
        left_tags: [],
        right_object_id: "HOST",
        right_id: "_deviceList_CLUSTER",
        right_name: "所属集群",
        right_description: "主机",
        right_min: 0,
        right_max: 1,
        right_groups: [],
        right_tags: [],
        __id: "deviceList",
        __isRelation: true,
        __inverted: false,
      },
      {
        id: "type",
        name: "集群类型",
        __id: "type",
        __isRelation: false,
      },
      {
        relation_id: "APP_clusters_CLUSTER",
        left_object_id: "CLUSTER",
        left_id: "appId",
        left_name: "所属应用",
        left_description: "集群",
        left_min: 0,
        left_max: 1,
        left_groups: [],
        left_tags: [],
        right_object_id: "APP",
        right_id: "clusters",
        right_name: "集群",
        right_description: "所属应用",
        right_min: 0,
        right_max: -1,
        right_groups: [],
        right_tags: [],
        __id: "appId",
        __isRelation: true,
        __inverted: true,
      },
    ]);
  });

  it("should getFixedStyle", () => {
    expect(getFixedStyle({ left: 304, width: 1098 })).toStrictEqual({
      position: "fixed",
      left: 304,
      bottom: 0,
      width: 1098,
    });
    expect(getFixedStyle(undefined)).toStrictEqual({});
  });
  it("should getBatchEditableFileds by modelData", () => {
    const modelData = {
      name: "主机",
      objectId: "TEST",
      attrList: [
        {
          id: "test_json",
          name: "test_json",
          protected: false,
          custom: "true",
          unique: "false",
          readonly: "false",
          required: "false",
          tag: ["test2"],
          description: "",
          tips: "",
          wordIndexDenied: false,
          isInherit: false,
          notifyDenied: false,
          inheritObjectId: "",
        },
      ],
      relation_list: [
        {
          relation_id: "EASYOPS.WIMIETEST_TEST_EASYOPS_WIMIETEST_TEST",
          name: "",
          protected: false,
          notifyDenied: false,
          isInherit: false,
          left_object_id: "EASYOPS.WIMIETEST",
          leftInheritObjectId: "",
          left_id: "TEST",
          left_description: "3344",
          left_name: "212",
          left_min: 0,
          left_max: 1,
          left_groups: [],
          left_tags: ["基本信息"],
          left_required: false,
          right_object_id: "TEST",
          rightInheritObjectId: "",
          right_id: "EASYOPS_WIMIETEST",
          right_description: "212",
          right_name: "3344",
          right_min: 0,
          right_max: 1,
          right_groups: [],
          right_tags: [],
          right_required: false,
        },
        {
          relation_id: "TESTJJ_TEST_TESTJJ_TEST",
          name: "",
          protected: false,
          notifyDenied: false,
          isInherit: false,
          left_object_id: "TESTJJ",
          leftInheritObjectId: "",
          left_id: "TEST",
          left_description: "j",
          left_name: "t",
          left_min: 0,
          left_max: -1,
          left_groups: [],
          left_tags: ["基本信息"],
          left_required: false,
          right_object_id: "TEST",
          rightInheritObjectId: "",
          right_id: "TESTJJ",
          right_description: "t",
          right_name: "j",
          right_min: 0,
          right_max: -1,
          right_groups: [],
          right_tags: ["test"],
          right_required: false,
        },
      ],
      view: {
        attr_order: ["test_json", "TESTJJ", "EASYOPS_WIMIETEST"],
      },
    };
    expect(getBatchEditableFields(modelData)).toEqual([
      {
        id: "test_json",
        name: "test_json",
        protected: false,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["test2"],
        description: "",
        tips: "",
        wordIndexDenied: false,
        isInherit: false,
        notifyDenied: false,
        inheritObjectId: "",
        __isRelation: false,
        __id: "test_json",
      },
      {
        id: "TESTJJ",
        isRelation: true,
        relation_id: "TESTJJ_TEST_TESTJJ_TEST",
        name: "j",
        objectId: "TESTJJ",
        protected: false,
        notifyDenied: false,
        isInherit: false,
        left_object_id: "TEST",
        leftInheritObjectId: "",
        left_id: "TESTJJ",
        left_description: "t",
        left_name: "j",
        left_min: 0,
        left_max: -1,
        left_groups: [],
        left_tags: ["test"],
        left_required: false,
        right_object_id: "TESTJJ",
        rightInheritObjectId: "",
        right_id: "TEST",
        right_description: "j",
        right_name: "t",
        right_min: 0,
        right_max: -1,
        right_groups: [],
        right_tags: ["基本信息"],
        right_required: false,
        __isRelation: true,
        __id: "TESTJJ",
        __inverted: true,
      },
      {
        id: "EASYOPS_WIMIETEST",
        isRelation: true,
        relation_id: "EASYOPS.WIMIETEST_TEST_EASYOPS_WIMIETEST_TEST",
        name: "3344",
        objectId: "EASYOPS.WIMIETEST",
        protected: false,
        notifyDenied: false,
        isInherit: false,
        left_object_id: "TEST",
        leftInheritObjectId: "",
        left_id: "EASYOPS_WIMIETEST",
        left_description: "212",
        left_name: "3344",
        left_min: 0,
        left_max: 1,
        left_groups: [],
        left_tags: [],
        left_required: false,
        right_object_id: "EASYOPS.WIMIETEST",
        rightInheritObjectId: "",
        right_id: "TEST",
        right_description: "3344",
        right_name: "212",
        right_min: 0,
        right_max: 1,
        right_groups: [],
        right_tags: ["基本信息"],
        right_required: false,
        __isRelation: true,
        __id: "EASYOPS_WIMIETEST",
        __inverted: true,
      },
    ]);
  });
});

describe("treeEnumFormat", () => {
  const value = ["A1/B1/C1", "A1/B1", "A1/B1/C2", "A1"];
  it("treeEnumFormat", () => {
    const result = treeEnumFormat(value);
    expect(result).toEqual([
      {
        children: [
          {
            children: [
              {
                children: null,
                id: "A1/B1/C1",
                isLeaf: true,
                parentId: "A1/B1",
                title: "C1",
                value: "A1/B1/C1",
              },
              {
                children: null,
                id: "A1/B1/C2",
                isLeaf: true,
                parentId: "A1/B1",
                title: "C2",
                value: "A1/B1/C2",
              },
            ],
            id: "A1/B1",
            isLeaf: false,
            parentId: "A1",
            title: "B1",
            value: "A1/B1",
          },
        ],
        id: "A1",
        isLeaf: false,
        parentId: "",
        title: "A1",
        value: "A1",
      },
    ]);
    const result2 = treeEnumFormat("A1/B1/C1\nA1/B1\nA1/B1/C2\nA1");
    expect(result2).toEqual([
      {
        children: [
          {
            children: [
              {
                children: null,
                id: "A1/B1/C1",
                isLeaf: true,
                parentId: "A1/B1",
                title: "C1",
                value: "A1/B1/C1",
              },
              {
                children: null,
                id: "A1/B1/C2",
                isLeaf: true,
                parentId: "A1/B1",
                title: "C2",
                value: "A1/B1/C2",
              },
            ],
            id: "A1/B1",
            isLeaf: false,
            parentId: "A1",
            title: "B1",
            value: "A1/B1",
          },
        ],
        id: "A1",
        isLeaf: false,
        parentId: "",
        title: "A1",
        value: "A1",
      },
    ]);
  });
});
describe("nodeData", () => {
  it("nodeData", () => {
    const result = nodeData({
      id: "123",
      title: "123",
      isLeaf: true,
      value: "123",
    });
    expect(result).toEqual({
      id: "123",
      title: "123",
      isLeaf: true,
      value: "123",
      children: null,
    });
    const result2 = nodeData({
      id: "123",
      title: "123",
      isLeaf: false,
      value: "123",
    });
    expect(result2).toEqual({
      id: "123",
      title: "123",
      isLeaf: false,
      value: "123",
      children: [],
    });
  });
});
