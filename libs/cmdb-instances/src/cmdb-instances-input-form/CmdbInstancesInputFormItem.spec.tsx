/* eslint-disable react/display-name */
import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";

import { CmdbInstancesInputFormItem } from "./CmdbInstancesInputFormItem";

interface InstanceListModalProps {
  onSelected: (instanceList: any[]) => void;
}

const instance = {
  instanceId: "123",
  ip: "192.168.100.100"
};

jest.mock("../instance-list-modal/InstanceListModal", () => ({
  InstanceListModal: (props: InstanceListModalProps): React.ReactElement => {
    const handleOk = (): void => {
      if (props.onSelected) {
        props.onSelected([
          {
            instanceId: "123",
            ip: "192.168.100.100"
          }
        ]);
      }
    };

    return <button onClick={handleOk}>确认</button>;
  }
}));

jest.mock("@sdk/cmdb-sdk");

describe("HostInstanceSelect", () => {
  const objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> } = {
    HOST: {
      objectId: "HOST",
      name: "主机",
      attrList: [
        {
          id: "name",
          name: "名称",
          value: {
            type: "str"
          }
        }
      ],
      relation_list: [],
      view: {
        attr_order: ["name"]
      }
    }
  };

  it("should work when select instances by InstanceListModal", async () => {
    jest.spyOn(InstanceApi, "postSearch").mockResolvedValue({
      list: [instance]
    });

    const { getByText } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          value: ["123"],
          ref: React.createRef<HTMLDivElement>()
        }}
      />
    );

    const button = getByText("SELECT_FROM_CMDB");
    fireEvent.click(button);

    const enterButton = getByText("确认");
    fireEvent.click(enterButton);
  });

  it("should work when input field value", async () => {
    jest.spyOn(InstanceApi, "postSearch").mockResolvedValue({
      list: [instance]
    });

    const { getByTestId } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          ref: React.createRef<HTMLDivElement>()
        }}
      />
    );

    const fieldValueInput = getByTestId("field-value-input");
    const fieldValueInputElement = fieldValueInput.parentElement.querySelector(
      "input"
    );
    fireEvent.change(fieldValueInputElement, {
      target: { value: "192.168.100.162" }
    });
    fireEvent.blur(fieldValueInputElement);
  });
});
