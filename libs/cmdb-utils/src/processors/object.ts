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

export function forEachAvailableFields(
  object: Partial<CmdbModels.ModelCmdbObject>,
  attrCallback?: (attr: Partial<CmdbModels.ModelObjectAttr>) => void,
  relationCallback?: (
    relation: Partial<CmdbModels.ModelObjectRelation>,
    sides: RelationObjectSides
  ) => void,
  fieldIds?: string[]
) {
  if (fieldIds) {
    const fieldIdSet = new Set(fieldIds);
    if (attrCallback) {
      object.attrList.forEach((attr) => {
        if (fieldIdSet.has(attr.id)) {
          attrCallback(attr);
        }
      });
    }

    if (relationCallback) {
      object.relation_list.forEach((relation) => {
        const sides = getRelationObjectSides(relation, object);
        const id = relation[`${sides.this}_id` as RelationIdKeys];

        if (fieldIdSet.has(id)) {
          relationCallback(relation, sides);
        }
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
        const sides = getRelationObjectSides(relation, object);
        const id = relation[`${sides.this}_id` as RelationIdKeys];

        if (!hideColumnsSet || !hideColumnsSet.has(id)) {
          relationCallback(relation, sides);
        }
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
