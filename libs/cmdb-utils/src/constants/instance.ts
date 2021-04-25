import i18n from "i18next";
import { NS_LIBS_CMDB_UTILS, K } from "../i18n/constants";
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
      "_agentStatus",
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
export enum SYSTEM_TYPE {
  MONITOR = "monitor",
  CMDB = "cmdb",
}
export const OPERATION_ACTION = [
  {
    value: "create",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.CREATE}`),
  },
  {
    value: "modify",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.EDIT}`),
  },
  {
    value: "delete",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.DELETE}`),
  },
  {
    value: "active",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.ACTIVE}`),
  },
  {
    value: "archive",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.ARCHIVE}`),
  },
  {
    value: "auto_discovery",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.AUTOMATIC_DISCOVERY}`),
  },
  {
    value: "batch_create",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.CREATE_IN_BATCHES}`),
  },
  {
    value: "batch_modify",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.EDIT_IN_BATCHES}`),
  },
];

export const OPERATION_TYPE = [
  {
    value: "instance",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.INSTANCE}`),
  },
  {
    value: "instance_relation",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.INSTANCE_RELATION}`),
  },
  {
    value: "object",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT}`),
  },
  {
    value: "object.attribute",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT_ATTRIBUTE}`),
  },
  {
    value: "object_relation",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT_RELATION}`),
  },
  {
    value: "object.relation_group",
    text: () => i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.RELATION_GROUP}`),
  },
];
