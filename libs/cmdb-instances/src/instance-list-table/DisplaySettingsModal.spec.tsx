import React from "react";
import { shallow } from "enzyme";
import { Button, Modal } from "antd";
import { HOST } from "./data-providers/__mocks__";
import { DisplaySettingsModal } from "./DisplaySettingsModal";
import { DisplaySettings } from "./DisplaySettings";

describe("DisplaySettingsModal", () => {
  it("should work", () => {
    const objectId = "HOST";
    const modelData = HOST;
    const fields = modelData.attrList.map((attr) => attr.id);
    let currentFields = fields;
    const defaultFields: string[] = [];
    const extraDisabledField = "hostname";
    const handleOk = jest.fn(({ fields }) => {
      currentFields = fields;
    });
    const handleCancel = jest.fn();
    const wrapper = shallow(
      <DisplaySettingsModal
        objectId={objectId}
        modelData={modelData}
        currentFields={currentFields}
        defaultFields={defaultFields}
        extraDisabledField={extraDisabledField}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    );

    // DisplaySettings onChange
    const nextFields = currentFields.slice(0, 2);
    const displaySettings = wrapper.find(DisplaySettings);
    expect(displaySettings.prop("currentFields")).toBe(currentFields);
    displaySettings.invoke("onChange")(nextFields);
    expect(wrapper.find(DisplaySettings).prop("currentFields")).toBe(
      nextFields
    );
    const footerButtons = shallow(
      wrapper.find(Modal).prop("footer") as React.ReactElement
    ).find(Button);
    // ok
    expect(currentFields).not.toBe(nextFields);
    footerButtons.filter("[data-testid='ok-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleOk).toBeCalledWith({
      fields: currentFields,
    });
    expect(currentFields).toBe(nextFields);
    // cancel
    footerButtons.filter("[data-testid='cancel-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleCancel).toBeCalled();
    expect(wrapper.find(DisplaySettings).prop("currentFields")).toEqual(fields);
    // reset
    footerButtons.filter("[data-testid='reset-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleOk).toBeCalledWith({
      fields: defaultFields,
      isReset: true,
    });
  });
});
