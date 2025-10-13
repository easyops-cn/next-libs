import React, { useEffect, useState } from "react";
import { Table } from "antd";
import {
  ModifiedModelObjectRelation,
  modifyModelData,
  TransHierRelationType,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../../../instance-list-table";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../../i18n/constants";
import i18n from "i18next";
import { get, sortBy, keyBy, head, isArray, filter } from "lodash";
import styles from "../../../instance-list-table/InstanceListTable.module.css";
import { fetchCmdbObjectRef } from "../../../data-providers";
import { handleHttpError } from "@next-core/brick-kit";
export interface InstanceRelationTableShowProps {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  relationData: ModifiedModelObjectRelation &
    TransHierRelationType & { __isTransHierRelation?: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  relationFieldUrlTemplate?: string;
  isPagination?: boolean;
  total?: number;
  relationTablePagination?: {
    current?: number;
    pageSize?: number;
  };
  paginationChange?: (
    page: number,
    pageSize: number,
    relationData: ModifiedModelObjectRelation
  ) => Promise<void> | void;
  hideRelationLink?: boolean;
  onInstanceSourceChange?: (instanceSource: string) => void;
  filterInstanceSourceDisabled?: boolean;
  externalSourceId?: string;
  relationGangedConfig?: Record<string, any>;
}
export function reOrderAttrs(fields: string[], fieldOrder: string[] = []) {
  return sortBy(fields, (field) => {
    const index = fieldOrder.indexOf(field);
    return index === -1 ? fields.length : index;
  });
}
export function getRelationShowFields(
  defaultRelationFields: string[],
  oppositeAttrList: string[],
  attr_order: string[] = []
) {
  let showFields = oppositeAttrList;
  if (defaultRelationFields?.length) {
    showFields = reOrderAttrs(
      defaultRelationFields.map((item: string) =>
        item.startsWith("#") ? item.slice(1) : item
      ),
      attr_order
    );
  }
  return showFields;
}

function getHiddenColumns(
  data: any[],
  oppositeModelData: any,
  relationData: ModifiedModelObjectRelation,
  relationGangedConfig?: Record<string, any>
): string[] {
  const oppositeAttrList = oppositeModelData.attrList.map(
    (attr: any) => attr.id
  );
  if (
    relationGangedConfig &&
    relationData?.left_max === 1 &&
    relationGangedConfig?.rightObjectId === relationData?.right_object_id &&
    relationGangedConfig?.objectId === relationData?.left_object_id
  ) {
    const attrData = head(data)?.[relationGangedConfig?.rightControlAttrId];
    const attrType = get(
      filter(
        oppositeModelData.__fieldList,
        (o: any) => o.id === relationGangedConfig?.rightControlAttrId
      ),
      "[0].value.type"
    );
    if (attrData && attrType === "arr" && isArray(attrData)) {
      const nonIncludedControlFields = filter(
        relationGangedConfig?.control || [],
        (attr: any) => !attrData.includes(attr)
      );
      return oppositeAttrList.filter((item: any) =>
        nonIncludedControlFields.includes(item)
      );
    }
  }

  return [];
}
//istanbul ignore next
export function InstanceRelationTableShow(
  props: InstanceRelationTableShowProps
): React.ReactElement {
  const {
    modelDataMap,
    relationData,
    value,
    relationFieldUrlTemplate,
    paginationChange,
    total,
    relationTablePagination,
    externalSourceId,
    relationGangedConfig,
  } = props;
  const [oppositeModelDataMap, setOppositeModelDataMap] = useState({});
  /**
   * 实例详情中展示对端实例的关系时，需要重新拉取对端关系所关联的模型。
   * 如在主机详情中展示负责人所在的角色，需要拿到与USER相关的模型ROLE@ONEMODEL
   * 而原来的modelDataMap是与HOST相关的，可能不包括ROLE@ONEMODEL，就造成取不到角色的showKey
   */
  useEffect(() => {
    const fetchOppositeModelData = async () => {
      const modelListData = await fetchCmdbObjectRef(
        relationData.__isTransHierRelation
          ? relationData.relation_object
          : relationData.right_object_id,
        externalSourceId
      );
      setOppositeModelDataMap(keyBy(modelListData.data, "objectId"));
    };
    fetchOppositeModelData().catch((error) => {
      handleHttpError(error);
    });
  }, [relationData, externalSourceId]);
  const [instanceSourceQuery, setInstanceSourceQuery] = useState(null);

  let modelData = modelDataMap[relationData.left_object_id];
  let lastPath: string;

  let oppositeModelData = modifyModelData(
    modelDataMap[
      relationData.__isTransHierRelation
        ? relationData.relation_object
        : relationData.right_object_id
    ]
  );
  if (relationData.__isTransHierRelation) {
    const paths = relationData.query_path.split(".");
    lastPath = paths[paths.length - 1];
    const lastPathSourceObjectId =
      oppositeModelData?.relation_list?.find(
        (item: any) =>
          item.left_id === lastPath &&
          item.right_object_id === relationData.relation_object
      )?.left_object_id ||
      oppositeModelData?.relation_list?.find(
        (item: any) =>
          item.right_id === lastPath &&
          item.left_object_id === relationData.relation_object
      )?.right_object_id;
    modelData =
      modelDataMap[lastPathSourceObjectId] ||
      (oppositeModelDataMap as any)[lastPathSourceObjectId];
  }
  // 如果指定了relation_default_attr，则取里面的字段
  const defaultRelationFields = get(modelData, [
    "view",
    "relation_default_attr",
    relationData.__isTransHierRelation ? lastPath : relationData.__id,
  ]);

  const fieldIds = getRelationShowFields(
    defaultRelationFields,
    oppositeModelData.attrList.map((attr) => attr.id),
    get(oppositeModelData, ["view", "attr_order"])
  );
  //过滤掉视图不可见字段
  const hideModelData = oppositeModelData.view?.hide_columns ?? [];
  oppositeModelData = {
    ...oppositeModelData,
    attrList: oppositeModelData.attrList.filter(
      (item: any) => !hideModelData.includes(item.id)
    ),
    relation_list: oppositeModelData.relation_list.filter(
      (item: any) =>
        !(
          (hideModelData.includes(item.left_id) &&
            item.left_object_id === props.relationData.right_object_id) ||
          (hideModelData.includes(item.right_id) &&
            item.right_object_id === props.relationData.right_object_id)
        )
    ),
  };
  const hiddenColumns = getHiddenColumns(
    value,
    oppositeModelData,
    relationData,
    relationGangedConfig
  );

  return (
    <div style={{ display: "grid" }}>
      <InstanceListTable
        detailUrlTemplates={
          props.hideRelationLink
            ? null
            : {
                [relationData.right_object_id]:
                  "/next-cmdb-instance-management/next/#{objectId}/instance/#{instanceId}",
              }
        }
        idObjectMap={oppositeModelDataMap}
        modelData={oppositeModelData}
        instanceListData={{
          list: value,
        }}
        onInstanceSourceChange={(instanceQuery: any) => {
          props.onInstanceSourceChange(instanceQuery);
        }}
        filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
        autoBreakLine={true}
        fieldIds={fieldIds}
        selectDisabled={true}
        sortDisabled={true}
        configProps={{
          pagination: props.isPagination
            ? {
                showSizeChanger: true,
                total: total,
                pageSizeOptions: ["10", "20", "50"],
                ...relationTablePagination,
                onChange: (page: number, pageSize: number) => {
                  paginationChange(page, pageSize, relationData);
                },
                showTotal: (totals: number) => (
                  <span className={styles.totalText}>
                    {i18n.t(
                      `${NS_LIBS_CMDB_INSTANCES}:${K.PAGINATION_TOTAL_TEXT}`
                    )}{" "}
                    <strong className={styles.total}>{totals}</strong>{" "}
                    {i18n.t(
                      `${NS_LIBS_CMDB_INSTANCES}:${K.PAGINATION_TOTAL_UNIT}`
                    )}
                  </span>
                ),
              }
            : false,
        }}
        target={"_blank"}
        externalSourceId={externalSourceId}
        useExternalCmdbApi={externalSourceId ? true : false}
        hiddenColumns={hiddenColumns}
      ></InstanceListTable>
    </div>
  );
}
