import { CmdbModels } from "@next-sdk/cmdb-sdk";

type Sides = "left" | "right";
export type RelationIdKeys = "left_id" | "right_id";
export type RelationNameKeys = "left_name" | "right_name";
export type RelationObjectIdKeys = "left_object_id" | "right_object_id";

export interface RelationObjectSides {
  this: Sides;
  that: Sides;
}

export function getRelationObjectSides(
  relation: Partial<CmdbModels.ModelObjectRelation>,
  object: Partial<CmdbModels.ModelCmdbObject>
): RelationObjectSides {
  return relation.left_object_id === object.objectId
    ? { this: "left", that: "right" }
    : { this: "right", that: "left" };
}

export function isSelfRelation(
  relation: Partial<CmdbModels.ModelObjectRelation>
): boolean {
  return relation.left_object_id === relation.right_object_id;
}

export function forEachAvailableFields(
  object: Partial<CmdbModels.ModelCmdbObject>,
  attrCallback?: (
    attr: Partial<CmdbModels.ModelObjectAttr>,
    firstColumn?: boolean
  ) => void,
  relationCallback?: (
    relation: Partial<CmdbModels.ModelObjectRelation>,
    sides: RelationObjectSides,
    firstColumn?: boolean
  ) => void,
  fieldIds?: string[]
) {
  if (fieldIds) {
    const fieldIdSet = new Set(fieldIds);
    if (attrCallback) {
      object.attrList.forEach((attr) => {
        if (fieldIdSet.has(attr.id)) {
          fieldIds.indexOf(attr.id) === 0
            ? attrCallback(attr, true)
            : attrCallback(attr);
        }
      });
    }

    if (relationCallback) {
      object.relation_list.forEach((relation) => {
        let sidesArr: RelationObjectSides[] = [];
        if (isSelfRelation(relation)) {
          sidesArr = [
            { this: "left", that: "right" },
            { this: "right", that: "left" },
          ];
        } else {
          sidesArr = [getRelationObjectSides(relation, object)];
        }
        sidesArr.forEach((sides) => {
          const id = relation[`${sides.this}_id` as RelationIdKeys];

          if (fieldIdSet.has(id)) {
            fieldIds.indexOf(id) === 0
              ? relationCallback(relation, sides, true)
              : relationCallback(relation, sides);
          }
        });
      });
    }
  } else {
    let hideColumnsSet: Set<string>;

    if (object.view && object.view.hide_columns) {
      hideColumnsSet = new Set(object.view.hide_columns as string[]);
    }

    if (attrCallback) {
      object.attrList.forEach((attr) => {
        if (!hideColumnsSet || !hideColumnsSet.has(attr.id)) {
          attrCallback(attr);
        }
      });
    }

    if (relationCallback) {
      object.relation_list.forEach((relation) => {
        let sidesArr: RelationObjectSides[] = [];
        if (isSelfRelation(relation)) {
          sidesArr = [
            { this: "left", that: "right" },
            { this: "right", that: "left" },
          ];
        } else {
          sidesArr = [getRelationObjectSides(relation, object)];
        }
        sidesArr.forEach((sides) => {
          const id = relation[`${sides.this}_id` as RelationIdKeys];

          if (!hideColumnsSet || !hideColumnsSet.has(id)) {
            relationCallback(relation, sides);
          }
        });
      });
    }
  }
}
export function getDescription(
  relation: Partial<CmdbModels.ModelObjectRelation>,
  modelData: Partial<CmdbModels.ModelCmdbObject>
) {
  return (relation as Record<string, string>)[
    `${getRelationObjectSides(relation, modelData).that}_description`
  ];
}
export function getRelation(
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  relationSideId: string
) {
  return modelData.relation_list.find(
    (item: Partial<CmdbModels.ModelObjectRelation>) => {
      const sides = getRelationObjectSides(item, modelData);
      const key = (item as Record<string, string>)[`${sides.this}_id`];
      return relationSideId === key;
    }
  );
}
