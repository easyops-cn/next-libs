export const CMDB_RESOURCE_FIELDS_SETTINGS = {
  defaultFields: {
    APP: ["name", "businesses", "owner", "developer", "tester"],
    USER: ["name", "nickname", "user_email", "user_tel"],
    USER_GROUP: ["name", "_members"],
    "APP-HOST": ["ip", "hostname", "status"],
    HOST: [
      "hostname",
      "_agentStatus",
      "ip",
      "memSize",
      "osDistro",
      "cpuModel",
      "owner",
    ],
  },
  fixedFields: {
    APP: ["name"],
    USER: ["name"],
    USER_GROUP: ["name"],
    "APP-HOST": ["ip"],
    HOST: ["hostname", "ip"],
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
      "businessId",
    ],
    "APP-HOST": ["deviceId"],
    BUSINESS: ["businessId"],
    CLUSTER: ["_packageList", "clusterId", "packageId"],
    HOST: ["deviceId"],
  },
};

export const CMDB_MODAL_FIELDS_SETTINGS = {
  defaultFields: {
    HOST: ["ip", "hostname", "status", "owner", "_agentStatus"],
  },
  fixedFields: {
    HOST: ["ip"],
  },
  ignoredFields: CMDB_RESOURCE_FIELDS_SETTINGS.ignoredFields,
};
export const MAX_DEFAULT_FIELDS_COUNT = 8;
export const MAX_DEFAULT_MODAL_FIELDS_COUNT = 4;

export enum otherFieldIds {
  autoBreakLine = "_autoBreakLine_",
}

export const extraFieldAttrs = [
  {
    id: "creator",
    name: "创建者",
    isRelation: false,
    value: {
      type: "str",
    },
  },
  {
    id: "ctime",
    name: "创建时间",
    isRelation: false,
    value: {
      type: "datetime",
    },
  },
  {
    id: "modifier",
    name: "修改者",
    isRelation: false,
    value: {
      type: "str",
    },
  },
  {
    id: "mtime",
    name: "修改时间",
    isRelation: false,
    value: {
      type: "datetime",
    },
  },
];
export const clusterMap: Record<string, string> = {
  "0": "开发",
  "1": "测试",
  "2": "生产",
  "3": "预发布",
};
