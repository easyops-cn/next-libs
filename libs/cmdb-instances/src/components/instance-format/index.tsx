import React from "react";
import { isNil, isArray } from "lodash";
interface InstanceFormatProps {
  objectId?: string;
  attrModel?: any;
  attrData?: any;
}

export class InstanceFormat extends React.Component<InstanceFormatProps> {
  render(): React.ReactNode {
    return (
      <span className="attr-field">
        {this.format(this.props.attrModel, this.props.attrData)}
      </span>
    );
  }

  format(attrModel: any, value: any): string {
    let display;
    if (isNil(value)) {
      return "";
    }
    switch (attrModel.value.type) {
      case "arr":
        display = value.join("; ");
        break;
      case "enum":
        display = isArray(value)
          ? value.map(v => v.value).join(" | ")
          : value + "";
        break;
      default:
        display = value + "";
    }
    return display;
  }
}
