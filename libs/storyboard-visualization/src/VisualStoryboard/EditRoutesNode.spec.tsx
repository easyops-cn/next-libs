import React from "react";
import { shallow } from "enzyme";
import { Modal, Form, Input } from "antd";
import { EditRoutesNode } from "./EditRoutesNode";

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
        onCancel={jest.fn()}
        onOk={jest.fn()}
      />
    );
    expect(wrapper.find(Form.Item).length).toBe(1);

    wrapper.find(Input.TextArea).invoke("onChange")({
      target: {
        value: "[]"
      }
    } as any);

    wrapper.find(Modal).invoke("onOk")(null);
    wrapper.find(Modal).invoke("onCancel")(null);
    // Todo(steve): refine tests
  });

  it("should work when visible is false", () => {
    const wrapper = shallow(
      <EditRoutesNode visible={false} routesNode={null} />
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });
});
