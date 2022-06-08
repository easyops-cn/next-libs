import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";

import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";

import { CmdbInstancesInputFormItem } from "./CmdbInstancesInputFormItem";
import { InstanceListModalProps } from "../instance-list-modal/InstanceListModal";

type MockedComponentElement<P> = HTMLElement & { _props: P };

const instance = {
  instanceId: "123",
  ip: "192.168.100.100",
};

jest.mock("../instance-list-modal/InstanceListModal", () => ({
  InstanceListModal: (props: InstanceListModalProps): React.ReactElement => {
    const { title, ...restProps } = props;
    const handleOk = (): void => {
      if (props.onSelected) {
        props.onSelected([
          {
            instanceId: "123",
            ip: "192.168.100.100",
          },
        ]);
      }
    };

    return (
      <div
        {...restProps}
        ref={(el: HTMLElement) => {
          el &&
            ((el as MockedComponentElement<InstanceListModalProps>)._props =
              props);
        }}
      >
        <button onClick={handleOk}>确认</button>
      </div>
    );
  },
}));

jest.mock("@next-sdk/cmdb-sdk");

(InstanceApi_postSearch as jest.Mock).mockResolvedValue({
  list: [instance],
});

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
            type: "str",
          },
        },
      ],
      relation_list: [],
      view: {
        attr_order: ["name"],
      },
    },
  };

  it("should work when select instances by InstanceListModal", async () => {
    const { getByText } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          value: ["123"],
          ref: React.createRef<HTMLDivElement>(),
        }}
      />
    );

    const button = getByText("SELECT_FROM_CMDB");
    fireEvent.click(button);

    const enterButton = getByText("确认");
    fireEvent.click(enterButton);
  });

  it("should work when input field value", async () => {
    const { getByTestId } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          ref: React.createRef<HTMLDivElement>(),
        }}
      />
    );

    const fieldValueInput = getByTestId("field-value-input");
    const fieldValueInputElement =
      fieldValueInput.parentElement.querySelector("input");
    fireEvent.change(fieldValueInputElement, {
      target: { value: "192.168.100.162" },
    });
    fireEvent.blur(fieldValueInputElement);
  });

  it("should work with previewEnabled property", async () => {
    const props = {
      objectMap,
      objectId: "HOST",
      fieldId: "ip",
    };
    const { queryByTestId, rerender } = render(
      <CmdbInstancesInputFormItem {...props} />
    );

    expect(queryByTestId("preview-button")).not.toBeInTheDocument();
    expect(queryByTestId("preview-modal")).not.toBeInTheDocument();

    rerender(<CmdbInstancesInputFormItem {...props} previewEnabled />);

    let previewButton = queryByTestId("preview-button");
    let previewModal = queryByTestId(
      "preview-modal"
    ) as MockedComponentElement<InstanceListModalProps>;

    expect(previewButton).toBeInTheDocument();
    expect(previewButton).toBeDisabled();
    expect(previewModal).toBeInTheDocument();
    expect(previewModal._props).toEqual(
      expect.objectContaining({ visible: false })
    );

    const instanceIds = ["123"];
    act(() => {
      (
        queryByTestId(
          "select-modal"
        ) as MockedComponentElement<InstanceListModalProps>
      )._props.onSelected(instanceIds);
    });

    await (global as any).flushPromises();

    previewButton = queryByTestId("preview-button");
    previewModal = queryByTestId(
      "preview-modal"
    ) as MockedComponentElement<InstanceListModalProps>;

    expect(previewButton).not.toBeDisabled();
    expect(previewModal._props).toEqual(
      expect.objectContaining({
        aq: [
          {
            instanceId: {
              $in: instanceIds,
            },
          },
        ],
      })
    );

    fireEvent.click(previewButton);

    expect(
      (
        queryByTestId(
          "preview-modal"
        ) as MockedComponentElement<InstanceListModalProps>
      )._props
    ).toEqual(expect.objectContaining({ visible: true }));
  });
});
