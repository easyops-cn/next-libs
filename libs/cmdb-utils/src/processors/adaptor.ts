import { get, set, chain, forEach, filter, includes, isNil } from "lodash";

import { getRuntime } from "@next-core/brick-kit";

const featureFlags = getRuntime().getFeatureFlags();

export const DEFAULT_ATTRIBUTE_TAG = ["基本信息"];

export const computeRelationRightEndDisplay = (
  relation,
  abjectDataKeyByObjectId
) => {
  if (
    relation.right_description !== null &&
    relation.right_description !== "" &&
    typeof relation.right_description !== "undefined"
  ) {
    return relation.right_description;
  } else {
    return `${relation.name}（${
      abjectDataKeyByObjectId[relation.right_object_id].name
    }）`;
  }
};
export const computeRelationDislay = computeRelationRightEndDisplay;

export const invertRelation = relation => ({
  ...Object.keys(relation).reduce((inverted, key) => {
    if (key.startsWith("left_")) {
      inverted[key.replace("left_", "right_")] = relation[key];
    } else if (key.startsWith("right_")) {
      inverted[key.replace("right_", "left_")] = relation[key];
    } else {
      inverted[key] = relation[key];
    }
    return inverted;
  }, {}),
  _inverted: true
});

export const invertRelationListBySide = (relationList, objectId) =>
  relationList.map(relation => {
    if (
      relation.right_object_id === objectId &&
      relation.left_object_id !== objectId
    ) {
      return invertRelation(relation);
    }
    return relation;
  });

  export const relationDataAPItoUI = (relationData, abjectDataKeyByObjectId) => ({
    ...relationData,
    display: computeRelationDislay(relationData, abjectDataKeyByObjectId)
  });

  export const splitRelationList = (relationList = []) =>
  relationList.reduce((arr, relation) => {
    if (relation.left_object_id === relation.right_object_id) {
      const invertedRelation = invertRelation(relation);
      arr.push(relation, invertedRelation);
    } else {
      arr.push(relation);
    }
    return arr;
  }, []);

/**
 * 给定模型数据，把关系列表重整成满足下面条件的格式
 * 1. 如果是模型自己指向自己的关系，那么复制一份，使得另一份左右颠倒
 * 2. 如果模型出现在关系的右边，并且不是自己指向自己的关系，那么左右颠倒，使得模型永远出现在左边
 * 3. 所有被颠倒的关系都会有 _inverted 标志
 * @param modelData
 * @param abjectDataKeyByObjectId
 */
 export const modelRelationListAPItoUI = (modelData, abjectDataKeyByObjectId) =>
 splitRelationList(
   invertRelationListBySide(modelData.relation_list, modelData.objectId)
 ).map(relation => relationDataAPItoUI(relation, abjectDataKeyByObjectId));

const getShowKey = () => {
  return featureFlags["config-show-key"];
};
export const getInstanceNameKey = (
  objectId,
  model: any = "",
  showKey = getShowKey()
) => {
  if (
    showKey &&
    model &&
    model.view.show_key &&
    model.view.show_key.length > 0
  ) {
    return model.view.show_key;
  } else {
    return objectId === "HOST" ? "hostname" : "name";
  }
};

/**
 * 把 API 吐过来的模型定义加上一些前端自己用的属性
 * @param modelData
 */
export const modelDataAPItoUI = modelData => ({
  ...modelData,
  _$shortName: modelData.name.replace(/管理$/, ""),
  _$listFieldsKey: `cmdbListFields-${modelData.objectId}`,
  _$modalFieldsKey: `cmdbModalFields-${modelData.objectId}`,
  _$sortKey: `cmdbOrderBy-${modelData.objectId}`,
  _$fallbackKey: `cmdbFallback-${modelData.objectId}`
});

export const sortModelAttrList = modelData => {
  const orderMap = new Map();
  forEach(get(modelData, "view.attr_order", []), (attr, index) => {
    orderMap.set(attr, index);
  });

  modelData.attrList = chain(modelData.attrList)
    // 先将自定义属性都放在最后
    .sortBy(attr => attr.protected === false)
    .sortBy(attr => attr.isRelation === true)
    .sortBy(attr => {
      if (orderMap.has(attr.id)) {
        return orderMap.get(attr.id);
      }
      return modelData.attrList.length;
    })
    .value();

  return modelData;
};

export const assignDefaultTagForAttrList = modelData => {
  modelData.attrList.forEach(attr => {
    if (get(attr, "tag", []).length === 0) {
      attr.tag = DEFAULT_ATTRIBUTE_TAG;
    }
  });
  return modelData;
};

const assignDefaultValueForViewRelationView = (
  relationList,
  modelMap?: any
) => {
  return relationList.reduce((view, relation) => {
    const rightObjectId = relation.right_object_id;
    const rightModel = modelMap ? modelMap[rightObjectId] : undefined;
    const keys = getInstanceNameKey(rightObjectId, rightModel);
    view[relation.left_id] = Array.isArray(keys) ? keys : [keys];
    return view;
  }, {});
};

export const computeCompatibleModelData = (
  modelData,
  abjectDataKeyByObjectId?: any
) => {
  const relationList = modelRelationListAPItoUI(
    modelData,
    abjectDataKeyByObjectId
  );

  const relationView = assignDefaultValueForViewRelationView(
    relationList,
    abjectDataKeyByObjectId
  );
  set(modelData, "view.relation_view", relationView);

  relationList.forEach(relation => {
    Object.assign(relation, {
      id: relation.left_id,
      value: {
        type: relation.left_max === 1 ? "FK" : "FKs",
        rule: { mode: "outer", obj: relation.right_object_id }
      },
      name: computeRelationDislay(relation, abjectDataKeyByObjectId),
      relation_view: relationView[relation.left_id],
      right_object_id: relation.right_object_id,
      isRelation: true
    });
  });

  // 对自关联关系做进一步过滤： for 视图设置
  let hide_columns = get(modelData, "view.hide_columns", []);
  if (!isNil(modelData.view) && modelData.view.showHideAttrs) {
    hide_columns = [];
  }
  const filteredRelationList = filter(
    relationList,
    relation => !includes(hide_columns, relation.id)
  );

  // 兼容未写入的属性类型 暂时全转成str
  const attrAdaptor = type => {
    if (
      ![
        "str",
        "int",
        "enum",
        "arr",
        "date",
        "datetime",
        "struct",
        "structs",
        "FK",
        "FKs",
        "ip",
        "float",
        "bool",
        "enums"
      ].includes(type)
    ) {
      type = "str";
    }
    return type;
  };
  let modifyAttrList = [...modelData.attrList, ...filteredRelationList];
  modifyAttrList = modifyAttrList.map(item => {
    item.value.type = attrAdaptor(item.value.type);
    if (["struct", "structs"].includes(item.value.type)) {
      item.value.struct_define.forEach(inner => {
        inner.type = attrAdaptor(inner.type);
      });
    }
    return item;
  });

  return assignDefaultTagForAttrList(
    sortModelAttrList({
      ...modelData,
      attrList: modifyAttrList
    })
  );
};
