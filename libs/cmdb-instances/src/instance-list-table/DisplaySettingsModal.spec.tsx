import React from "react";
import { shallow } from "enzyme";
import { DisplaySettingsModal } from "./DisplaySettingsModal";
import { HOST } from "./data-providers/__mocks__";
import { Button, Modal } from "antd";

describe("DisplaySettingsModal", () => {
  const objectId = "HOST";
  const modelData = HOST;
  const handleOk = jest.fn();
  const handleCancel = jest.fn();
  const defaultFields: string[] = [];
  const extraDisabledField = "hostname";

  it("should work", () => {
    const wrapper = shallow(
      <DisplaySettingsModal
        objectId={objectId}
        currentFields={modelData.attrList.map((attr) => attr.id)}
        modelData={modelData}
        onOk={handleOk}
        onCancel={handleCancel}
        defaultFields={defaultFields}
        extraDisabledField={extraDisabledField}
      />
    );

    const footerButtons = shallow(
      wrapper.find(Modal).prop("footer") as React.ReactElement
    ).find(Button);
    footerButtons.filter("[data-testid='ok-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleOk).toBeCalledWith({
      fields: modelData.attrList.map((attr) => attr.id),
    });
    footerButtons.filter("[data-testid='cancel-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleCancel).toBeCalled();
    footerButtons.filter("[data-testid='reset-button']").invoke("onClick")(
      {} as unknown as React.MouseEvent<HTMLElement>
    );
    expect(handleOk).toBeCalledWith({
      fields: defaultFields,
      isReset: true,
    });
  });
});
