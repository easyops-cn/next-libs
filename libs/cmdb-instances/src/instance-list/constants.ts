import { ModelObjectAttrValue } from "@next-sdk/cmdb-sdk/dist/types/model/cmdb";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { addResourceBundle } from "../i18n";
addResourceBundle();

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

export interface extraFieldAttrType {
  id?: string;
  name?: string;
  isRelation?: boolean;
  value?: Partial<ModelObjectAttrValue>;
}

export const extraFieldAttrs: extraFieldAttrType[] = [
  {
    id: "creator",
    name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATOR}`),
    isRelation: false,
    value: {
      type: "str",
    },
  },
  {
    id: "ctime",
    name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATE_TIME}`),
    isRelation: false,
    value: {
      type: "datetime",
    },
  },
  {
    id: "modifier",
    name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFIER}`),
    isRelation: false,
    value: {
      type: "str",
    },
  },
  {
    id: "mtime",
    name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFY_TIME}`),
    isRelation: false,
    value: {
      type: "datetime",
    },
  },
];

export const objectListCache = new Map<string, any>();
