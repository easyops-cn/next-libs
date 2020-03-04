import React from "react";
import { shallow } from "enzyme";
import { InstanceFormat } from ".";

describe("InstanceFormat", () => {
  it("should work", () => {
    const wrapper = shallow(<InstanceFormat />);
    expect(wrapper.find(".attr-field").length).toBe(1);
    expect(
      wrapper
        .find(".attr-field")
        .at(0)
        .text()
    ).toBe("");
    expect(wrapper).toMatchSnapshot();
  });

  it("attrData is string or number", () => {
    const data = [
      {
        attrModel: {
          value: { type: "str" }
        },
        value: "string"
      },
      {
        attrModel: {
          value: { type: "int" }
        },
        value: 1024
      }
    ];
    data.forEach(item => {
      const wrapper = shallow(
        <InstanceFormat attrData={item.value} attrModel={item.attrModel} />
      );
      expect(
        wrapper
          .find(".attr-field")
          .at(0)
          .text()
      ).toBe(item.value + "");
    });
  });
  it("attrData is null", () => {
    const wrapper = shallow(<InstanceFormat attrData={null} />);
    expect(
      wrapper
        .find(".attr-field")
        .at(0)
        .text()
    ).toBe("");
  });

  it("attrData is array", () => {
    const data = {
      attrModel: {
        value: { type: "arr" }
      },
      value: ['{a:"a"}', "b"]
    };
    const wrapper = shallow(
      <InstanceFormat attrData={data.value} attrModel={data.attrModel} />
    );
    expect(
      wrapper
        .find(".attr-field")
        .at(0)
        .text()
    ).toBe('{a:"a"}; b');
  });

  it("attrData is enum", () => {
    const data: { attrModel: any; value: { value: string }[] | string } = {
      attrModel: {
        value: { type: "enum" }
      },
      value: [{ value: '{a:"a"}' }, { value: "b" }]
    };
    let wrapper = shallow(
      <InstanceFormat attrData={data.value} attrModel={data.attrModel} />
    );
    expect(
      wrapper
        .find(".attr-field")
        .at(0)
        .text()
    ).toBe('{a:"a"} | b');

    data.value = "enum string";
    wrapper = shallow(
      <InstanceFormat attrData={data.value} attrModel={data.attrModel} />
    );
    expect(
      wrapper
        .find(".attr-field")
        .at(0)
        .text()
    ).toBe("enum string");
  });
});
