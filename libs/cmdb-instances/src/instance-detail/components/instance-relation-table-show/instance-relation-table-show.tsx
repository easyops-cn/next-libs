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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InstanceRelationTableShow(
  props: InstanceRelationTableShowProps
): React.ReactElement {
  const { modelDataMap, relationData, value, relationFieldUrlTemplate } = props;
  const oppositeModelData = modifyModelData(
    modelDataMap[relationData.right_object_id]
  );
  return (
    <div style={{ maxWidth: "500px" }}>
      <InstanceListTable
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
