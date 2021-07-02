import React from "react";
import { Table } from "antd";
import {
  ModifiedModelObjectRelation,
  modifyModelData,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../../../instance-list-table";

export interface InstanceRelationTableShowProps {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  relationData: ModifiedModelObjectRelation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  relationFieldUrlTemplate?: string;
}

//istanbul ignore next
export function InstanceRelationTableShow(
  props: InstanceRelationTableShowProps
): React.ReactElement {
  const { modelDataMap, relationData, value, relationFieldUrlTemplate } = props;
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
    <div style={{ maxWidth: "500px" }}>
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
        fieldIds={oppositeModelData.attrList.map((attr) => attr.id)}
        selectDisabled={true}
        sortDisabled={true}
        configProps={{
          pagination: false,
        }}
      ></InstanceListTable>
    </div>
  );
}
