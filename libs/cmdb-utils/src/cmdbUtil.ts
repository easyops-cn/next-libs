import {
  CmdbModels,
  InstanceApi_GetDetailResponseBody,
} from "@next-sdk/cmdb-sdk";
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
  const instanceShowName = nameKeys.map((nameKey) => {
    return instanceData[nameKey];
  });
  return composeInstanceShowName(instanceShowName);
}

export const getInstanceNameKey = (objectId: string | number) =>
  objectId === "HOST" ? "hostname" : "name";

export const getInstanceName = (
  instanceData: Partial<InstanceApi_GetDetailResponseBody>,
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
  __id?: string;
  __inverted?: boolean;
  __isRelation?: boolean;
}

export const getBatchEditableRelations = (
  modelData: Partial<CmdbModels.ModelCmdbObject>
): Partial<BatchEditableRelation>[] => {
  const cloneModelData = modifyModelData(modelData);
  cloneModelData.relation_list.forEach((item: any) => {
    const side = getRelationObjectSides(item, modelData);
    Object.assign(item, {
      id: item[`${side.this}_id`],
      name: item[`${side.that}_description`],
      isRelation: true,
      objectId: item[`${side.that}_object_id`],
    });
  });
  return cloneModelData.relation_list;
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
    [`${rightSideId}.instanceId`]: query,
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
    (row) =>
      `${row.error}：${_.map(row.data, (item) =>
        _.get(
          _.find(
            failedInstances,
            (instance) => item.instanceId === instance.instanceId
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

export const IGNORED_FIELDS: Record<string, string[]> = {
  APP: [
    "appId",
    "packageId",
    "_packageList",
    "installPath",
    "runUser",
    "businessId",
  ],
  BUSINESS: ["businessId"],
  CLUSTER: ["clusterId", "packageId", "_packageList"],
  HOST: ["deviceId"],
};

export interface ModifiedModelObjectAttr extends CmdbModels.ModelObjectAttr {
  __isRelation: boolean;
  __id: string;
}

export interface ModifiedModelObjectRelation
  extends CmdbModels.ModelObjectRelation {
  __isRelation: boolean;
  __id: string;
  __inverted: boolean;
}

export type ModifiedModelObjectField =
  | Partial<ModifiedModelObjectAttr>
  | Partial<ModifiedModelObjectRelation>;

export interface ModifiedModelCmdbObject extends CmdbModels.ModelCmdbObject {
  __fieldList: ModifiedModelObjectField[];
}

export function modifyModelData(
  modelData: Partial<CmdbModels.ModelCmdbObject>
): Partial<ModifiedModelCmdbObject> {
  const clonedModelData: Partial<ModifiedModelCmdbObject> =
    _.cloneDeep(modelData);

  const fieldIdList: string[] = [];
  const fieldMap: Record<string, ModifiedModelObjectField> = {};
  const ignoredFields = IGNORED_FIELDS[clonedModelData.objectId] || [];

  clonedModelData.attrList.forEach((attr) => {
    if (!ignoredFields.includes(attr.id)) {
      const clonedAttr: Partial<ModifiedModelObjectAttr> = _.cloneDeep(attr);

      clonedAttr.__isRelation = false;
      clonedAttr.__id = attr.id;

      fieldIdList.push(clonedAttr.__id);
      fieldMap[clonedAttr.__id] = clonedAttr;
    }
  });

  clonedModelData.relation_list.forEach((relation) => {
    if (
      relation.left_object_id === clonedModelData.objectId &&
      !ignoredFields.includes(relation.left_id)
    ) {
      const clonedRelation: Partial<ModifiedModelObjectRelation> =
        _.cloneDeep(relation);

      clonedRelation.__isRelation = true;
      clonedRelation.__id = clonedRelation.left_id;
      clonedRelation.__inverted = false;

      fieldIdList.push(clonedRelation.__id);
      fieldMap[clonedRelation.__id] = clonedRelation;
    }

    if (
      relation.right_object_id === clonedModelData.objectId &&
      !ignoredFields.includes(relation.right_id)
    ) {
      const clonedRelation: any = _.cloneDeep(relation);

      const invertedFields = [
        "object_id",
        "id",
        "name",
        "description",
        "min",
        "max",
        "groups",
        "tags",
        "required",
      ];
      invertedFields.forEach((invertedField) => {
        const tempFieldValue = clonedRelation[`left_${invertedField}`];
        clonedRelation[`left_${invertedField}`] =
          clonedRelation[`right_${invertedField}`];
        clonedRelation[`right_${invertedField}`] = tempFieldValue;
      });

      clonedRelation.__isRelation = true;
      clonedRelation.__id = clonedRelation.left_id;
      clonedRelation.__inverted = true;

      fieldIdList.push(clonedRelation.__id);
      fieldMap[clonedRelation.__id] = clonedRelation;
    }
  });

  const currentOrderedFieldIds = clonedModelData?.view?.attr_order || [];
  const orderedFieldIds: string[] = [];
  const notOrderedFieldIds: string[] = [];
  currentOrderedFieldIds.forEach((currentOrderedFieldId) => {
    if (fieldIdList.includes(currentOrderedFieldId)) {
      orderedFieldIds.push(currentOrderedFieldId);
    }
  });
  fieldIdList.forEach((fieldId) => {
    if (!orderedFieldIds.includes(fieldId)) {
      notOrderedFieldIds.push(fieldId);
    }
  });

  const fieldList: ModifiedModelObjectField[] = [];
  const attrList: Partial<ModifiedModelObjectAttr>[] = [];
  const relationList: Partial<ModifiedModelObjectRelation>[] = [];
  orderedFieldIds.forEach((orderedFieldId) => {
    fieldList.push(fieldMap[orderedFieldId]);
    if (fieldMap[orderedFieldId].__isRelation) {
      relationList.push(fieldMap[orderedFieldId]);
    } else {
      attrList.push(fieldMap[orderedFieldId]);
    }
  });
  notOrderedFieldIds.forEach((notOrderedFieldId) => {
    fieldList.push(fieldMap[notOrderedFieldId]);
    if (fieldMap[notOrderedFieldId].__isRelation) {
      relationList.push(fieldMap[notOrderedFieldId]);
    } else {
      attrList.push(fieldMap[notOrderedFieldId]);
    }
  });

  clonedModelData.__fieldList = fieldList;
  clonedModelData.attrList = attrList;
  clonedModelData.relation_list = relationList;

  return clonedModelData;
}
