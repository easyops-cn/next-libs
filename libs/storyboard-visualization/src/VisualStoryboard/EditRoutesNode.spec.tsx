import React from "react";
import { shallow } from "enzyme";
import { Modal, Form } from "antd";
import { EditRoutesNode } from "./EditRoutesNode";
import { JsonEditor } from "./JsonEditor";

describe("EditRoutesNode", () => {
  it("should work", () => {
    const routesNode: any = {
      brickData: {
        brick: "a"
      }
    };
    const wrapper = shallow(
      <EditRoutesNode
        visible={true}
        routesNode={routesNode}
        editable={true}
        onCancel={jest.fn()}
        onOk={jest.fn()}
      />
    );
    expect(wrapper.find(Form.Item).length).toBe(1);

    wrapper.find(JsonEditor).invoke("onChange")("[]");

    wrapper.find(Modal).invoke("onOk")(null);

    // Read only
    wrapper.setProps({
      editable: false
    });
    expect(wrapper.find(Modal).prop("footer")).toBe(null);

    // Todo(steve): refine tests
    wrapper.find(Modal).invoke("onCancel")(null);
  });

  it("should work when visible is false", () => {
    const wrapper = shallow(
      <EditRoutesNode visible={false} routesNode={null} />
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });
});
