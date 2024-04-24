import React from "react";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { shallow } from "enzyme";
import { XmlDisplayBrick } from "./XmlDisplayBrick";
import { Tooltip, Modal } from "antd";

jest.mock("@next-libs/code-display-components", () => ({
  CodeDisplay: function Mock(props: any) {
    return <div data-theme={props.theme}>code display</div>;
  },
}));
describe(XmlDisplayBrick, () => {
  it("should work", () => {
    const wrapper = shallow(
      <XmlDisplayBrick value={null} isNumControlEllipsis={false} />
    );
    expect(wrapper.children().length).toBe(0);

    const value1 = '<?xml version="1.0" encoding="UTF-8"?>';
    wrapper.setProps({
      value: value1,
    });
    wrapper.update();
    expect(wrapper.find(Tooltip).prop("title")).toBe(
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW}`)
    );
    expect(wrapper.find(".xmlWrapper").length).toBe(1);
    expect(wrapper.find(".text").text()).toBe(value1);

    wrapper.setProps({
      isNumControlEllipsis: true,
      num: 10,
    });
    wrapper.update();
    wrapper.find("a").invoke("onClick")(
      event as unknown as React.MouseEvent<HTMLElement, MouseEvent>
    );
    expect(wrapper.find(Modal).prop("visible")).toBe(true);
    expect(wrapper.find(Modal).prop("title")).toBe("XML");
  });
});
