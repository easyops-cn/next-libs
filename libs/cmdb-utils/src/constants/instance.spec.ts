import { OPERATION_ACTION, OPERATION_TYPE } from "../constants/instance";
import i18n from "i18next";
import { NS_LIBS_CMDB_UTILS, K } from "../i18n/constants";
import { find } from "lodash";
describe("instance", () => {
  test.each([
    ["create", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.CREATE}`)],
    ["modify", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.EDIT}`)],
    ["delete", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.DELETE}`)],
    ["active", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.ACTIVE}`)],
    ["archive", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.ARCHIVE}`)],
    [
      "auto_discovery",
      i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.AUTOMATIC_DISCOVERY}`),
    ],
    ["batch_create", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.CREATE_IN_BATCHES}`)],
    ["batch_modify", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.EDIT_IN_BATCHES}`)],
  ])("test OPERATION_ACTION", (received, expected) => {
    const opAction = find(OPERATION_ACTION, { value: received });
    expect(opAction.text()).toEqual(expected);
  });
  test.each([
    ["instance", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.INSTANCE}`)],
    [
      "instance_relation",
      i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.INSTANCE_RELATION}`),
    ],
    ["object", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT}`)],
    ["object.attribute", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT_ATTRIBUTE}`)],
    ["object_relation", i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.OBJECT_RELATION}`)],
    [
      "object.relation_group",
      i18n.t(`${NS_LIBS_CMDB_UTILS}:${K.RELATION_GROUP}`),
    ],
  ])("test OPERATION_TYPE", (received, expected) => {
    const opType = find(OPERATION_TYPE, { value: received });
    expect(opType.text()).toEqual(expected);
  });
});
