import React from "react";
import { isNil, isArray } from "lodash";
import { formatAttrValue } from "@libs/cmdb-utils";

interface InstanceFormatProps {
  objectId?: string;
  attrModel?: any;
  attrData?: any;
}

export class InstanceFormat extends React.Component<InstanceFormatProps> {
  render(): React.ReactNode {
    return (
      <span className="attr-field">
        {formatAttrValue(
          this.props.attrData,
          this.props.attrModel,
          this.props.objectId
        )}
      </span>
    );
  }
}
