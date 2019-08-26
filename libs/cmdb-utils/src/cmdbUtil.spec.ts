import {
  composeInstanceShowName,
  getInstanceShowName,
  getInstanceNameKey,
  getInstanceName,
  getBatchEditableAttributes,
  getBatchEditableRelations,
  composeErrorMessage,
  getRelationQuery
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
          unique: "false"
        },
        {
          id: "label",
          readonly: "false",
          unique: "true"
        },
        {
          id: "title",
          readonly: "true",
          unique: "false"
        }
      ]
    };
    expect(getBatchEditableAttributes(modelData)).toEqual([
      {
        id: "name",
        readonly: "false",
        unique: "false"
      }
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
          isRelation: false
        }
      ],
      relation_list: [
        {
          relation_id: "_deviceList_CLUSTER",
          left_description: "所属集群",
          left_id: "deviceList",
          left_object_id: "CLUSTER",
          right_id: "_deviceList_CLUSTER_HOST",
          right_object_id: "HOST",
          right_description: "主机"
        },
        {
          relation_id: "_owner_HOST",
          left_description: "负责运维的主机",
          left_id: "owner",
          left_object_id: "HOST",
          right_id: "HOST_owner_USER",
          right_object_id: "USER",
          right_description: "运维负责人"
        }
      ]
    };
    expect(getBatchEditableRelations(modelData)).toEqual([
      {
        relation_id: "_deviceList_CLUSTER",
        left_description: "所属集群",
        left_id: "deviceList",
        left_object_id: "CLUSTER",
        right_id: "_deviceList_CLUSTER_HOST",
        right_object_id: "HOST",
        right_description: "主机",
        id: "_deviceList_CLUSTER_HOST",
        objectId: "CLUSTER",
        name: "所属集群",
        isRelation: true
      },
      {
        relation_id: "_owner_HOST",
        left_description: "负责运维的主机",
        left_id: "owner",
        left_object_id: "HOST",
        right_id: "HOST_owner_USER",
        right_object_id: "USER",
        right_description: "运维负责人",
        id: "owner",
        objectId: "USER",
        name: "运维负责人",
        isRelation: true
      }
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
      right_description: "主机"
    };
    expect(getRelationQuery("123", relation1, false, "$eq")).toEqual({
      "deviceList.instanceId": { $eq: "123" }
    });
    expect(getRelationQuery(["123", "456"], relation1, false)).toEqual({
      "deviceList.instanceId": { $in: ["123", "456"] }
    });
    expect(getRelationQuery(["123", "456"], relation1, true)).toEqual({
      "_deviceList_CLUSTER_HOST.instanceId": { $in: ["123", "456"] }
    });
  });
});
