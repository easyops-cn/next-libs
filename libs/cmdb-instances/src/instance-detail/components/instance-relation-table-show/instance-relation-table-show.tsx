import React from "react";
import { Table } from "antd";
import {
  ModifiedModelObjectRelation,
  modifyModelData,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

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

  const columns = oppositeModelData.attrList.map((r) => ({
    title: r.name,
    dataIndex: r.id,
    key: r.id,
  }));
  return (
    <div style={{ maxWidth: "500px" }}>
      <Table
        columns={columns}
        scroll={{ x: "max-content" }}
        dataSource={value}
        pagination={false}
      ></Table>
    </div>
  );
}
