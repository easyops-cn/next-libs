import React, { useState } from "react";
import { Table } from "antd";
import {
  ModifiedModelObjectRelation,
  modifyModelData,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../../../instance-list-table";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../../i18n/constants";
import i18n from "i18next";
import styles from "../../../instance-list-table/InstanceListTable.module.css";
export interface InstanceRelationTableShowProps {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  relationData: ModifiedModelObjectRelation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  relationFieldUrlTemplate?: string;
  isPagination?: boolean;
}

//istanbul ignore next
export function InstanceRelationTableShow(
  props: InstanceRelationTableShowProps
): React.ReactElement {
  const { modelDataMap, relationData, value, relationFieldUrlTemplate } = props;
  const [instanceListData, setInstanceListData] = useState({
    list: props.value.slice(0, 10),
  });
  let oppositeModelData = modifyModelData(
    modelDataMap[relationData.right_object_id]
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
        instanceListData={instanceListData}
        fieldIds={oppositeModelData.attrList.map((attr) => attr.id)}
        selectDisabled={true}
        sortDisabled={true}
        configProps={{
          pagination: props.isPagination
            ? {
                showSizeChanger: true,
                total: value?.length,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, pageSize) => {
                  setInstanceListData({
                    list: value.slice(
                      (page - 1) * pageSize,
                      (page - 1) * pageSize + pageSize
                    ),
                  });
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
