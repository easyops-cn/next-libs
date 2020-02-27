import React from "react";
import { shallow } from "enzyme";
import { Modal, Form, Radio, Input } from "antd";
import { EditBrickNode } from "./EditBrickNode";
import { GeneralEditor } from "./GeneralEditor";

describe("EditBrickNode", () => {
  it("should work", () => {
    // Brick
    const brickNode: any = {
      brickData: {
        brick: "a"
      }
    };
    const handleOk = jest.fn();
    const wrapper = shallow(
      <EditBrickNode
        visible={true}
        brickNode={brickNode}
        editable={true}
        onOk={handleOk}
      />
    );
    expect(wrapper.find(Form.Item).length).toBe(9);

    wrapper
      .find(Form.Item)
      .filter({ label: "构件名" })
      .find(Input)
      .invoke("onChange")({
      target: {
        value: "new-brick"
      }
    } as any);

    wrapper
      .find(Form.Item)
      .filter({ label: "构件属性" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    wrapper
      .find(Form.Item)
      .filter({ label: "构件事件" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    wrapper
      .find(Form.Item)
      .filter({ label: "插槽配置" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    wrapper
      .find(Form.Item)
      .filter({ label: "onPageLoad" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    wrapper
      .find(Form.Item)
      .filter({ label: "onAnchorLoad" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    wrapper
      .find(Form.Item)
      .filter({ label: "onAnchorUnload" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    // Invalid input
    wrapper
      .find(Form.Item)
      .filter({ label: "useResolves" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).not.toBeCalled();

    // Valid input
    wrapper
      .find(Form.Item)
      .filter({ label: "useResolves" })
      .find(GeneralEditor)
      .invoke("onChange")("[]");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).toBeCalled();
    handleOk.mockClear();

    // Provider
    wrapper
      .find(Form.Item)
      .filter({ label: "类型" })
      .find(Radio.Group)
      .invoke("onChange")({
      target: {
        value: "provider"
      }
    } as any);
    expect(wrapper.find(Form.Item).length).toBe(8);

    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).toBeCalled();
    handleOk.mockClear();

    // Template
    wrapper
      .find(Form.Item)
      .filter({ label: "类型" })
      .find(Radio.Group)
      .invoke("onChange")({
      target: {
        value: "template"
      }
    } as any);
    expect(wrapper.find(Form.Item).length).toBe(4);

    wrapper
      .find(Form.Item)
      .filter({ label: "模板名" })
      .find(Input)
      .invoke("onChange")({
      target: {
        value: "new-template"
      }
    } as any);

    wrapper
      .find(Form.Item)
      .filter({ label: "模板参数" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");

    // expect(
    //   wrapper.find(Form.Item).filter({ label: "useResolves" }).length
    // ).toBe(1);
    // wrapper.find(Modal).invoke("onOk")(null);

    // Invalid input
    wrapper
      .find(Form.Item)
      .filter({ label: "useResolves" })
      .find(GeneralEditor)
      .invoke("onChange")("{}");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).not.toBeCalled();

    // Valid input
    wrapper
      .find(Form.Item)
      .filter({ label: "useResolves" })
      .find(GeneralEditor)
      .invoke("onChange")("[]");
    wrapper.find(Modal).invoke("onOk")(null);
    expect(handleOk).toBeCalled();

    // Read only
    wrapper.setProps({
      editable: false
    });
    expect(wrapper.find(Modal).prop("footer")).toBe(null);
  });

  it("should work when visible is false", () => {
    const wrapper = shallow(<EditBrickNode visible={false} brickNode={null} />);
    expect(wrapper.find(Modal).prop("visible")).toBe(false);
  });
});
