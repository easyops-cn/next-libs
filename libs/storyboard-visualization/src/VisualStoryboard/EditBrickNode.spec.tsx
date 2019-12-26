import React from "react";
import { shallow } from "enzyme";
import { Modal, Form, Radio, Input } from "antd";
import { EditBrickNode } from "./EditBrickNode";
import { JsonEditor } from "./JsonEditor";

describe("EditBrickNode", () => {
  it("should work", () => {
    const brickNode: any = {
      brickData: {
        brick: "a"
      }
    };
    const wrapper = shallow(
      <EditBrickNode
        visible={true}
        brickNode={brickNode}
        onCancel={jest.fn()}
        onOk={jest.fn()}
      />
    );
    expect(wrapper.find(Form.Item).length).toBe(4);
    expect(
      wrapper
        .find(Form.Item)
        .at(1)
        .prop("label")
    ).toBe("构件名");

    wrapper
      .find(Form.Item)
      .at(1)
      .find(Input)
      .invoke("onChange")({
      target: {
        value: "new-brick"
      }
    } as any);
    wrapper
      .find(Form.Item)
      .at(2)
      .find(JsonEditor)
      .invoke("onChange")("{}");
    wrapper
      .find(Form.Item)
      .at(3)
      .find(JsonEditor)
      .invoke("onChange")("{}");

    wrapper.find(Modal).invoke("onOk")(null);

    wrapper
      .find(Form.Item)
      .at(0)
      .find(Radio.Group)
      .invoke("onChange")({
      target: {
        value: "template"
      }
    } as any);
    wrapper
      .find(Form.Item)
      .at(1)
      .find(Input)
      .invoke("onChange")({
      target: {
        value: "new-template"
      }
    } as any);
    wrapper
      .find(Form.Item)
      .at(2)
      .find(JsonEditor)
      .invoke("onChange")("{}");

    expect(
      wrapper
        .find(Form.Item)
        .at(1)
        .prop("label")
    ).toBe("模板名");

    wrapper.find(Modal).invoke("onCancel")(null);
    wrapper.find(Modal).invoke("onOk")(null);
    // Todo(steve): refine tests
  });

  it("should work when visible is false", () => {
    const wrapper = shallow(<EditBrickNode visible={false} brickNode={null} />);
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });
});
