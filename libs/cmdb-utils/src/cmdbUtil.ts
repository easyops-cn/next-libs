import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { CMDB_RESOURCE_FIELDS_SETTINGS } from "./constants";
import { getRelationObjectSides } from "./processors";
import _ from "lodash";
export function composeInstanceShowName(nameKeys: string[], maxCharNum = 0) {
  let d;
  // 即使超过2个，也只显示前2个
  if (nameKeys.length >= 2) {
    // 如果两个都不为空，则显示为xx(yy)的格式
    if (nameKeys[0] && nameKeys[1]) {
      d = `${nameKeys[0]}(${nameKeys[1]})`;
    } else if (nameKeys[0]) {
      // 如果第2个为空，则只显示第1个
      d = `${nameKeys[0]}`;
    } else if (nameKeys[1]) {
      // 如果第1个为空，则只显示第2个
      d = `${nameKeys[1]}`;
    } else {
      // 如果2个都为空，则显示为-
      d = "-";
    }
  } else if (nameKeys.length == 1 && nameKeys[0]) {
    d = nameKeys[0];
  } else {
    d = "-";
  }
  if (maxCharNum > 0 && d.length > maxCharNum) {
    return d.substr(0, maxCharNum - 3) + "...";
  } else {
    return d;
  }
}

export function getInstanceShowName(
  instanceData: { [key: string]: string },
  nameKeys: string[]
) {
  const instanceShowName = nameKeys.map(nameKey => {
    return instanceData[nameKey];
  });
  return composeInstanceShowName(instanceShowName);
}

export const getInstanceNameKey = (objectId: string | number) =>
  objectId === "HOST" ? "hostname" : "name";

export const getInstanceName = (
  instanceData: Partial<InstanceApi.GetDetailResponseBody>,
  objectId?: string | number
) =>
  objectId
    ? instanceData[getInstanceNameKey(objectId)]
    : instanceData.name || instanceData.hostname;

export const getBatchEditableAttributes = (
  modelData: Partial<CmdbModels.ModelCmdbObject>
): Partial<CmdbModels.ModelObjectAttr>[] => {
  const ignoredFields: string[] =
    CMDB_RESOURCE_FIELDS_SETTINGS.ignoredFields[modelData.objectId] || [];
  return modelData.attrList.filter(
    (attribute: Partial<CmdbModels.ModelObjectAttr>) => {
      return (
        !ignoredFields.includes(attribute.id) &&
        attribute.readonly === "false" &&
        // filter unique attribute since they can not be batch edited.
        attribute.unique !== "true"
      );
    }
  );
};

export interface BatchEditableRelation extends CmdbModels.ModelCmdbObject {
  id: string;
  name: string;
  isRelation: boolean;
  objectId: string;
}

export const getBatchEditableRelations = (
  modelData: Partial<CmdbModels.ModelCmdbObject>
): Partial<BatchEditableRelation>[] => {
  modelData.relation_list.forEach((item: any) => {
    const side = getRelationObjectSides(item, modelData);
    Object.assign(item, {
      id: item[`${side.this}_id`],
      name: item[`${side.that}_description`],
      isRelation: true,
      objectId: item[`${side.that}_object_id`]
    });
  });
  return modelData.relation_list;
};
export function getRelationQuery(
  instanceId: any,
  relation: any,
  isLeftModel: boolean,
  operator?: string
) {
  const rightSideId = isLeftModel ? relation.right_id : relation.left_id;
  const query = _.isArray(instanceId)
    ? { $in: instanceId }
    : { [operator]: instanceId };
  return {
    [`${rightSideId}.instanceId`]: query
  };
}
export function composeErrorMessage(
  errorData: any,
  failedInstances: Partial<CmdbModels.ModelFailInstance>[],
  context: { modelData: Partial<CmdbModels.ModelCmdbObject>; nameKey: string }
): string {
  const action = "批量编辑" + context.modelData.name;
  const failedList = _.map(
    errorData.data,
    row =>
      `${row.error}：${_.map(row.data, item =>
        _.get(
          _.find(
            failedInstances,
            instance => item.instanceId === instance.instanceId
          ),
          context.nameKey
        )
      ).join("、")}`
  );
  const partialError =
    errorData.update_count > 0
      ? `部分失败，其中 ${errorData.update_count} 个成功，${errorData.failed_count} 个`
      : "";

  return `${action}${partialError}失败（${failedList.join("，")}）。`;
}
