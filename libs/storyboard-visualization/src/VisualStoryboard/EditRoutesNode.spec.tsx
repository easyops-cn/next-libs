import React from "react";
import { shallow } from "enzyme";
import { Form } from "@ant-design/compatible";
import { Modal } from "antd";
import { EditRoutesNode } from "./EditRoutesNode";
import { GeneralEditor } from "./GeneralEditor";

describe("EditRoutesNode", () => {
  it("should work", () => {
    const routesNode: any = {
      brickData: {
        brick: "a",
      },
    };
    const handleOk = jest.fn();
    const wrapper = shallow(
      <EditRoutesNode
        visible={true}
        routesNode={routesNode}
        editable={true}
        onOk={handleOk}
      />
    );
    expect(wrapper.find(Form.Item).length).toBe(1);

    // Invalid input
    wrapper.find(GeneralEditor).invoke("onChange")("{}");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).not.toBeCalled();

    // Valid input
    wrapper.find(GeneralEditor).invoke("onChange")("[]");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).toBeCalled();

    // Read only
    wrapper.setProps({
      editable: false,
    });
    expect(wrapper.find(Modal).prop("footer")).toBe(null);
  });

  it("should work when visible is false", () => {
    const wrapper = shallow(
      <EditRoutesNode visible={false} routesNode={null} />
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });
});
