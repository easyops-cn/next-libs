import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";

import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";

import { CmdbInstancesInputFormItem } from "./CmdbInstancesInputFormItem";
import { InstanceListModalProps } from "../instance-list-modal/InstanceListModal";

type MockedComponentElement<P> = HTMLElement & { _props: P };

const instance = {
  instanceId: "123",
  ip: "192.168.100.162",
};

jest.mock("../instance-list-modal/InstanceListModal", () => ({
  InstanceListModal: (props: InstanceListModalProps): React.ReactElement => {
    const { title, ...restProps } = props;

    return (
      <div
        {...restProps}
        ref={(el: HTMLElement) => {
          el &&
            ((el as MockedComponentElement<InstanceListModalProps>)._props =
              props);
        }}
      />
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
    const handleChange = jest.fn();
    const handleChangeV2 = jest.fn();
    let ref;
    const { getByTestId } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          value: ["123"],
          onChange: handleChange,
          onChangeV2: handleChangeV2,
          ref: (el: HTMLDivElement) => (ref = el),
        }}
      />
    );

    expect(ref).not.toBeUndefined();

    const instanceIds = ["123"];
    act(() => {
      (
        getByTestId(
          "select-modal"
        ) as MockedComponentElement<InstanceListModalProps>
      )._props.onSelected(instanceIds);
    });

    await (global as any).flushPromises();

    expect(handleChange).toBeCalledWith(instanceIds);
    expect(handleChangeV2).toBeCalledWith(
      instanceIds.map((instanceId) => expect.objectContaining({ instanceId }))
    );
  });

  it("should work when input field value", async () => {
    const handleChange = jest.fn();
    const handleChangeV2 = jest.fn();
    const { getByTestId } = render(
      <CmdbInstancesInputFormItem
        {...{
          objectMap,
          objectId: "HOST",
          fieldId: "ip",
          onChange: handleChange,
          onChangeV2: handleChangeV2,
        }}
      />
    );

    const fieldValueInput = getByTestId("field-value-input");
    const fieldValueInputElement =
      fieldValueInput.parentElement.querySelector("input");
    fireEvent.change(fieldValueInputElement, {
      target: { value: instance.ip },
    });
    fireEvent.blur(fieldValueInputElement);

    await (global as any).flushPromises();

    expect(handleChange).toBeCalledWith([instance.instanceId]);
    expect(handleChangeV2).toBeCalledWith([instance]);
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
