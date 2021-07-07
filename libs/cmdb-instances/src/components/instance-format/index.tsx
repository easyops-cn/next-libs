import React from "react";
import _, { isNil, isArray } from "lodash";
import { formatAttrValue } from "@next-libs/cmdb-utils";
import { Typography } from "antd";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../i18n/constants";
interface InstanceFormatProps {
  objectId?: string;
  attrModel?: any;
  attrData?: any;
}

export class InstanceFormat extends React.Component<InstanceFormatProps> {
  render(): React.ReactNode {
    let component = (
      <span className="attr-field">
        {formatAttrValue(
          this.props.attrData,
          this.props.attrModel,
          this.props.objectId
        )}
      </span>
    );
    let text: string;
    if (this.props.attrModel?.value?.type === "json") {
      text = _.isString(this.props.attrData)
        ? this.props.attrData
        : JSON.stringify(this.props.attrData, null, 2);
      component = (
        <Typography.Paragraph
          copyable={{
            tooltips: [
              i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY}`),
              i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.COPY_SUCCESS}`),
            ],
            text,
          }}
        >
          {component}
        </Typography.Paragraph>
      );
    }
    return <>{component}</>;
  }
}
