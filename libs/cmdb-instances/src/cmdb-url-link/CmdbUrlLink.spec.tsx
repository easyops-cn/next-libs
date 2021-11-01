import React from "react";
import { shallow } from "enzyme";
import { checkUrl, CmdbUrlLink, generateUrlLink } from "./CmdbUrlLink";

const linkStr1 = "[百度](https://www.baidu.com)";

const linkStr2 = "[](https://www.baidu.com)";

const linkStr3 = "https://www.baidu.com";

describe("CmdbUrlLink", () => {
  it("should work", () => {
    const wrapper = shallow(<CmdbUrlLink linkStr={linkStr1} />);
    expect(wrapper.find("span").length).toBe(1);
    expect(wrapper.find("a").length).toBe(1);
    expect(wrapper.find("a").props().href).toBe("https://www.baidu.com");
    expect(wrapper.find("a").props().children).toBe("百度");
    wrapper.setProps({
      linkStr: linkStr2,
    });
    wrapper.update();
    expect(wrapper.find("a").props().children).toBe("https://www.baidu.com");
    wrapper.setProps({
      linkStr: "",
    });
    wrapper.update();
    expect(wrapper.find(CmdbUrlLink)).toBeTruthy();
  });
  it("checkUrl to pass", () => {
    const res = checkUrl("https://www.baidu.com");
    expect(res).toBe("https://www.baidu.com");
    const res2 = checkUrl("test");
    expect(res2).toBe("http://test");
    expect(checkUrl("/next")).toBe("/next");
    expect(checkUrl("")).toBe("");
  });
  it("generateUrlLink to pass", () => {
    const res = generateUrlLink(linkStr1);
    expect(res).toMatchObject({
      title: "百度",
      url: "https://www.baidu.com",
    });
    const res1 = generateUrlLink(linkStr2);
    expect(res1).toMatchObject({
      title: "https://www.baidu.com",
      url: "https://www.baidu.com",
    });
    const res2 = generateUrlLink(linkStr3);
    expect(res2).toMatchObject({
      title: "https://www.baidu.com",
      url: "https://www.baidu.com",
    });
  });
});
