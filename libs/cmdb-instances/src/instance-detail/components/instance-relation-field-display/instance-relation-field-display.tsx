import React from "react";
import { Popover } from "antd";
import { get, sortBy } from "lodash";

import { Link } from "@libs/basic-components";
import {
  ModifiedModelObjectField,
  ModifiedModelObjectRelation,
  modifyModelData,
  getInstanceShowName,
  getInstanceNameKeys,
  parseTemplate,
} from "@libs/cmdb-utils";
import { CmdbModels } from "@sdk/cmdb-sdk";

import { userDisplayFieldIdList } from "./constants";

import style from "./instance-relation-field-display.module.css";

export interface InstanceRelationFieldDisplayProps {
  modelDataMap: { [objectId: string]: CmdbModels.ModelCmdbObject };
  relationData: ModifiedModelObjectRelation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  relationFieldUrlTemplate?: string;
}

export function InstanceRelationFieldDisplay(
  props: InstanceRelationFieldDisplayProps
): React.ReactElement {
  const { modelDataMap, relationData, value, relationFieldUrlTemplate } = props;
  const oppositeModelData = modifyModelData(
    modelDataMap[relationData.right_object_id]
  );

  const renderUserInstancePopover = (
    fieldList: ModifiedModelObjectField[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oppositeInstanceData: any
  ): React.ReactElement => {
    return (
      <div className={style.instancePopover}>
        {fieldList.map((field) => {
          if (field.__isRelation) {
            return <></>;
          } else {
            return (
              <>
                <div className={style.instancePopoverLabel}>{field.name}：</div>
                <div className={style.instancePopoverValue}>
                  {oppositeInstanceData[field.__id]}
                </div>
              </>
            );
          }
        })}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRelationFieldValue = (
    oppositeInstanceDataList: any[]
  ): React.ReactElement => {
    return (
      <div>
        {oppositeInstanceDataList
          .map((oppositeInstanceData) =>
            getInstanceShowName(
              oppositeInstanceData,
              getInstanceNameKeys(oppositeModelData)
            )
          )
          .join("，")}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderUserInstances = (
    oppositeInstanceDataList: any[]
  ): React.ReactElement => {
    const displayFieldList = oppositeModelData.__fieldList.filter((field) =>
      userDisplayFieldIdList.includes(field.__id)
    );
    const fieldOrder = get(oppositeModelData, "view.attr_order", []);
    const sortedDisplayFieldList = sortBy(displayFieldList, (field) => {
      const index = fieldOrder.findIndex(
        (fieldId: string) => field.__id === fieldId
      );
      return index === -1 ? userDisplayFieldIdList.length : index;
    });

    return (
      <div>
        {oppositeInstanceDataList.map((oppositeInstanceData) => {
          let userInstance = (
            <div className={style.userInstanceDisplay}>
              {getInstanceShowName(
                oppositeInstanceData,
                getInstanceNameKeys(oppositeModelData)
              )}
            </div>
          );

          if (relationFieldUrlTemplate) {
            userInstance = (
              <Link
                to={parseTemplate(
                  relationFieldUrlTemplate,
                  oppositeInstanceData
                )}
              >
                {userInstance}
              </Link>
            );
          }

          return (
            <Popover
              key={oppositeInstanceData.instanceId}
              content={renderUserInstancePopover(
                sortedDisplayFieldList,
                oppositeInstanceData
              )}
            >
              {userInstance}
            </Popover>
          );
        })}
      </div>
    );
  };

  const render = (): React.ReactElement => {
    return (
      <div>
        {oppositeModelData.objectId === "USER"
          ? renderUserInstances(value)
          : renderRelationFieldValue(value)}
      </div>
    );
  };

  return render();
}
