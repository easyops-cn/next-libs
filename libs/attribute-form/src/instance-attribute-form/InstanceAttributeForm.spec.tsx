import React from "react";
import { mount } from "enzyme";
import {
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue
} from "../__mocks__";
import {
  InstanceAttributeForm,
  LegacyInstanceAttributeForm
} from "./InstanceAttributeForm";

describe("InstanceAttributeForm", () => {
  const props = {
    attributeFormControlInitialValueMap: mockFetchCmdbInstanceDetailReturnValue,
    basicInfoAttrList: mockFetchCmdbObjectDetailReturnValue.attrList
  };

  it("should work", () => {
    const wrapper = mount(<InstanceAttributeForm {...props} />);
    const instance = wrapper.instance() as LegacyInstanceAttributeForm;
    expect(instance.props).toEqual(props);
    // expect(wrapper).toMatchSnapshot();
  });
});
