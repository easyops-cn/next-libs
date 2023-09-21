import React from "react";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { shallow } from "enzyme";
import { JsonDisplayBrick } from "./JsonDisplayBrick";
import { Tooltip, Modal } from "antd";

jest.mock("@next-libs/code-editor-components", () => ({
  CodeEditorItem: function MockEditor(props: any) {
    return <div data-theme={props.theme}>code editor</div>;
  },
}));
describe(JsonDisplayBrick, () => {
  it("should work", () => {
    const wrapper = shallow(
      <JsonDisplayBrick name="JSON" value={null} isNumControlEllipsis={false} />
    );
    expect(wrapper.children().length).toBe(0);
    const value1 = {
      a: "b",
    };
    wrapper.setProps({
      value: value1,
    });
    wrapper.update();
    expect(wrapper.find(Tooltip).prop("title")).toBe(
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW}`)
    );
    expect(wrapper.find(".jsonWrapper").length).toBe(1);
    expect(wrapper.find(".text").text()).toBe(JSON.stringify(value1));
    const value2 = {
      test_a: [
        {
          test: "1234617899981737n",
          instanceId: "adadaw133441dfr",
          name: "test_a",
        },
      ],
      test_b: [
        {
          name: "test_b",
        },
      ],
    };
    wrapper.setProps({
      value: value2,
      isNumControlEllipsis: true,
    });
    wrapper.update();
    wrapper.find("a").invoke("onClick")(
      event as unknown as React.MouseEvent<HTMLElement, MouseEvent>
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(true);
    expect(wrapper.find(Modal).prop("title")).toBe("JSON");
  });
});
