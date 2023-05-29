import React from "react";
import { Table } from "antd";
import {
  ModifiedModelObjectRelation,
  modifyModelData,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../../../instance-list-table";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../../i18n/constants";
import i18n from "i18next";
import { get } from "lodash";
import styles from "../../../instance-list-table/InstanceListTable.module.css";
export interface InstanceRelationTableShowProps {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  relationData: ModifiedModelObjectRelation;
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
  ) => Promise<void>;
}
export function getRelationShowFields(
  defaultRelationFields: string[],
  oppositeAttrList: string[]
) {
  return defaultRelationFields?.length
    ? defaultRelationFields.map((item: string) =>
        item.startsWith("#") ? item.slice(1) : item
      )
    : oppositeAttrList;
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
  } = props;
  const modelData = modelDataMap[relationData.left_object_id];
  let oppositeModelData = modifyModelData(
    modelDataMap[relationData.right_object_id]
  );
  // 如果指定了relation_default_attr，则取里面的字段
  const defaultRelationFields = get(modelData, [
    "view",
    "relation_default_attr",
    relationData.__id,
  ]);

  const fieldIds = getRelationShowFields(
    defaultRelationFields,
    oppositeModelData.attrList.map((attr) => attr.id)
  );
  //过滤掉视图不可见字段
  const hideModelData = oppositeModelData.view.hide_columns || [];
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

  return (
    <div style={{ display: "grid" }}>
      <InstanceListTable
        detailUrlTemplates={{
          [relationData.right_object_id]:
            "/next-cmdb-instance-management/next/#{objectId}/instance/#{instanceId}",
        }}
        idObjectMap={props.modelDataMap}
        modelData={oppositeModelData}
        instanceListData={{
          list: value,
        }}
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
                onChange: (page, pageSize) => {
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
      ></InstanceListTable>
    </div>
  );
}
