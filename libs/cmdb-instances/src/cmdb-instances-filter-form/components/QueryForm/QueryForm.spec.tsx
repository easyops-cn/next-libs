import React from "react";
import { mount } from "enzyme";

import { modifyModelData } from "@next-libs/cmdb-utils";
import { MinusCircleOutlined } from "@ant-design/icons";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

import { QueryForm } from "./QueryForm";
import { Button, Select, Input } from "antd";
import { QueryOperatorValue } from "../../constants/query";
import { ModelAttributeFormControl } from "../../../model-attribute-form-control/ModelAttributeFormControl";

const hostObjectData: Partial<CmdbModels.ModelCmdbObject> = {
  objectId: "HOST",
  name: "主机",
  attrList: [
    {
      id: "hostname",
      name: "主机名",
      value: {
        type: "str",
      },
    },
    {
      id: "int",
      name: "整型",
      value: {
        type: "int",
      },
    },
    {
      id: "float",
      name: "浮点型",
      value: {
        type: "float",
      },
    },
    {
      id: "bool",
      name: "布尔型",
      value: {
        type: "bool",
      },
    },
    {
      id: "enum",
      name: "枚举型",
      value: {
        type: "enum",
      },
    },
    {
      id: "ip",
      name: "IP",
      value: {
        type: "ip",
      },
    },
    {
      id: "date",
      name: "日期",
      value: {
        type: "date",
      },
    },
    {
      id: "datetime",
      name: "时间",
      value: {
        type: "datetime",
      },
    },
  ],
  relation_list: [],
  view: {
    attr_order: ["hostname"],
  },
};

const objectMap: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> } = {
  HOST: hostObjectData,
};

describe("QueryForm", () => {
  it("should work", () => {
    const mockOnChange = jest.fn();
    const wrapper = mount(
      <QueryForm
        objectMap={objectMap}
        objectData={modifyModelData(hostObjectData)}
        query={{}}
        onChange={mockOnChange}
      />
    );

    let fieldSelect = wrapper
      .find(Select)
      .filter("[data-testid='field-select-0']");
    expect(fieldSelect).toHaveLength(0);

    wrapper.find(Button).filter("[data-testid='add-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    fieldSelect = wrapper.find(Select).filter("[data-testid='field-select-0']");
    expect(fieldSelect).toHaveLength(1);

    let operatorSelect = wrapper
      .find(Select)
      .filter("[data-testid='operator-select-0']");
    expect(operatorSelect).toHaveLength(0);
    const attr0 = hostObjectData.attrList[0];
    fieldSelect.invoke("onSelect")(attr0.id, {
      label: attr0.name,
      value: attr0.id,
    });
    operatorSelect = wrapper
      .find(Select)
      .filter("[data-testid='operator-select-0']");
    expect(operatorSelect).toHaveLength(1);

    let valueInput1 = wrapper
      .find(ModelAttributeFormControl)
      .filter("[data-testid='value-input-0']");
    expect(valueInput1).toHaveLength(0);
    operatorSelect.invoke("onSelect")(QueryOperatorValue.Equal, {
      label: "",
      value: QueryOperatorValue.Equal,
    });
    valueInput1 = wrapper
      .find(ModelAttributeFormControl)
      .filter("[data-testid='value-input-0']");
    expect(valueInput1).toHaveLength(1);

    expect(mockOnChange).not.toBeCalled();
    valueInput1.invoke("onChange")(["a"]);
    expect(mockOnChange).lastCalledWith({
      $and: [{ $or: [{ hostname: { $eq: "a" } }] }],
    });

    let removeButton = wrapper
      .find(MinusCircleOutlined)
      .filter("[data-testid='remove-button-0']");

    removeButton.invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    fieldSelect = wrapper.find(Select).filter("[data-testid='field-select-0']");
    operatorSelect = wrapper
      .find(Select)
      .filter("[data-testid='operator-select-0']");
    const valueInput2 = wrapper
      .find(Input)
      .filter("[data-testid='value-input-0']");
    removeButton = wrapper
      .find(MinusCircleOutlined)
      .filter("[data-testid='remove-button-0']");
    expect(fieldSelect).toHaveLength(0);
    expect(operatorSelect).toHaveLength(0);
    expect(valueInput2).toHaveLength(0);
    expect(removeButton).toHaveLength(0);
  });
});
