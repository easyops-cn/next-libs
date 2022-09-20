import React from "react";
import { shallow } from "enzyme";
import { Form } from "antd";
import { CodeEditorFormItem } from "./CodeEditorFormItem";

jest.mock("@next-libs/code-editor-components", () => ({
  CodeEditorItem: function MockEditor() {
    return <div>code editor</div>;
  },
}));

describe("VisualPropertyForm", () => {
  it("should work", async () => {
    const props = {
      name: "required",
      label: "必填项",
      required: true,
      mode: "yaml",
    };
    const wrapper = shallow(<CodeEditorFormItem {...props} />);

    // @ts-ignore
    wrapper.find("MockEditor").invoke("onValidate")([{ type: "error" }]);

    await expect(
      (wrapper.find(Form.Item).prop("rules")[1] as any).validator()
    ).rejects.toEqual("请填写正确的 yaml 语法");
    // @ts-ignore
    wrapper.find("MockEditor").invoke("onValidate")([]);

    await expect(
      (wrapper.find(Form.Item).prop("rules")[1] as any).validator()
    ).resolves.toEqual(undefined);
  });
});
