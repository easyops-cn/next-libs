import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { AttributeFormControlUrl } from "./AttributeFormControlUrl";

describe("AttributeFormControlUrl", () => {
  let wrapper: ReactWrapper<
    AttributeFormControlUrl["props"],
    AttributeFormControlUrl["state"],
    React.Component<{}, {}, any>
  >;
  let instance: React.Component<{}, {}, any>;
  const props = {
    value: "[百度](http://www.baidu.com)",
    onChange: jest.fn(),
    readOnly: true
  };

  beforeEach(() => {
    wrapper = mount(<AttributeFormControlUrl {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    props.onChange.mockClear();
  });

  it("should change url value", () => {
    const urlEle = wrapper.find("input").at(0);

    urlEle.simulate("change", {
      target: {
        value: "www.google.com"
      }
    });

    expect(props.onChange).toHaveBeenCalledWith("[百度](www.google.com)");

    urlEle.simulate("blur");
    expect(props.onChange).toHaveBeenCalledWith(
      "[百度](http://www.google.com)"
    );
  });

  it("should change title value", () => {
    const titleEle = wrapper.find("input").at(1);

    titleEle.simulate("change", {
      target: {
        value: "google"
      }
    });

    expect(props.onChange).toHaveBeenCalledWith(
      "[google](http://www.baidu.com)"
    );

    titleEle.simulate("blur");
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it("value should be null when props.value to equal null", () => {
    const newProps = Object.assign({}, props, {
      value: null
    });
    const wrapper = mount(<AttributeFormControlUrl {...newProps} />);

    const [urlEle, titleEle] = wrapper.find("input").map(node => node);
    expect(urlEle.props().value).toBeFalsy();
    expect(titleEle.props().value).toBeFalsy();
  });

  it("should work", () => {
    const { title, url } = AttributeFormControlUrl.breakDownValue(props.value);
    const [urlEle, titleEle] = wrapper.find("input").map(node => node);

    expect(urlEle.exists() && titleEle.exists()).toBeTruthy();
    expect(urlEle.props().value).toEqual(url);
    expect(urlEle.props().placeholder).toBe("请输入链接");
    expect(urlEle.props().type).toBe("url");
    expect(urlEle.props().readOnly).toBeTruthy();

    expect(titleEle.props().value).toEqual(title);
    expect(titleEle.props().placeholder).toBe("选填，请输入显示的标题");
    expect(titleEle.props().type).toBe("text");

    expect(wrapper).toMatchSnapshot();
  });
});
