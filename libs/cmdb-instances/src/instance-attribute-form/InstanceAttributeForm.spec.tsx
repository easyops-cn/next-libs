import React from "react";
import { mount } from "enzyme";
import {
  mockFetchCmdbObjectListReturnValue,
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue
} from "../__mocks__";
import {
  InstanceAttributeForm,
  LegacyInstanceAttributeForm
} from "./InstanceAttributeForm";

import { modifyModelData } from "@libs/cmdb-utils";

jest.mock("../i18n");

import i18n from "i18next";
jest.spyOn(i18n, "t").mockReturnValue("");

describe("InstanceAttributeForm", () => {
  const props = {
    objectList: mockFetchCmdbObjectListReturnValue,
    attributeFormControlInitialValueMap: mockFetchCmdbInstanceDetailReturnValue,
    basicInfoAttrList: modifyModelData(mockFetchCmdbObjectDetailReturnValue)
      .attrList
  };

  it("should work", () => {
    const wrapper = mount(<InstanceAttributeForm {...props} />);
    const instance = wrapper.instance() as LegacyInstanceAttributeForm;
    expect(instance.props).toEqual(props);
    // expect(wrapper).toMatchSnapshot();
  });
});
