const { EasyOpsConfig = {} } = window as any;
export const DefaultNameKey = "name";
export const BASIC_INFORMATION_RELATION_GROUP_ID = "basic_info";
export const BATCH_EDIT_RELATIONS_CHECKED_MAX =
  EasyOpsConfig.batchEditRelationsCheckedMax || 10;
export const CMDB_RESOURCE_FIELDS_SETTINGS: any = {
  defaultFields: {
    APP: ["name", "businesses", "owner", "developer", "tester"],
    USER: ["name", "nickname", "user_email", "user_tel"],
    USER_GROUP: ["name", "_members"],
    "APP-HOST": ["ip", "hostname", "status"],
    HOST: [
      "hostname",
      "ip",
      "cpuModel",
      "memSize",
      "osDistro",
      "owner",
      "_agentStatus"
    ]
  },
  fixedFields: {
    APP: ["name"],
    USER: ["name"],
    USER_GROUP: ["name"],
    "APP-HOST": ["ip"],
    HOST: ["hostname", "ip"]
  },
  ignoredFields: {
    APP: [
      /* !start: only community edition
           'businesses',
           !end: only community edition */
      "_packageList",
      "appId",
      "packageId",
      "installPath",
      "runUser",
      "businessId"
    ],
    "APP-HOST": ["deviceId"],
    BUSINESS: ["businessId"],
    CLUSTER: ["_packageList", "clusterId", "packageId"],
    HOST: ["deviceId"]
  }
};
export enum SYSTEM_TYPE {
  MONITOR = "monitor",
  CMDB = "cmdb"
}
export const OPERATION_ACTION = [
  {
    value: "create",
    text: "新建"
  },
  {
    value: "modify",
    text: "编辑"
  },
  {
    value: "delete",
    text: "删除"
  },
  {
    value: "active",
    text: "激活"
  },
  {
    value: "archive",
    text: "归档"
  },
  {
    value: "auto_discovery",
    text: "自动发现"
  },
  {
    value: "batch_create",
    text: "批量新建"
  },
  {
    value: "batch_modify",
    text: "批量编辑"
  }
];

export const OPERATION_TYPE = [
  {
    value: "instance",
    text: "实例"
  },
  {
    value: "instance_relation",
    text: "实例关系"
  },
  {
    value: "object",
    text: "模型"
  },
  {
    value: "object.attribute",
    text: "模型属性"
  },
  {
    value: "object_relation",
    text: "模型关系"
  },
  {
    value: "object.relation_group",
    text: "模型关系分组"
  }
];
