import React, { ChangeEvent } from "react";
import { shallow } from "enzyme";
import { AddStructModal, AddStructModalProps } from "./AddStructModal";
import { DatePicker, Input, InputNumber, Radio, Select } from "antd";
import moment from "moment";
import { attribute, structData } from "./mockData";
import { RadioChangeEvent } from "antd/lib/radio";
import { Attribute } from "./interfaces";

describe("AddStructModal", () => {
  const handleStoreFunction = jest.fn();
  const handleCancelFunction = jest.fn();
  const props = {
    structData,
    attribute,
    handleStoreFunction,
    handleCancelFunction,
    visible: false,
  };
  const wrapper = shallow<AddStructModalProps>(<AddStructModal {...props} />);
  const instance = wrapper.instance() as AddStructModal;
  it("should init addStructModal", () => {
    expect(wrapper).toBeTruthy();
    expect(instance.state.showError).toEqual(new Array(8).fill(false));
  });
  it("should call the store function", () => {
    const spy = jest.spyOn(props, "handleStoreFunction");

    wrapper.setProps({ visible: true });
    instance.handleStore();
    expect(spy).toBeCalledWith(structData);
  });
  it("should call the cancel function", () => {
    const spy = jest.spyOn(props, "handleCancelFunction");
    instance.handleCloseModal();
    expect(spy).toBeCalled();
  });
  it("should call the handleValueChange when change the int value", () => {
    wrapper.find(InputNumber).prop("onChange")(100);
    expect(instance.state.structData["int"]).toEqual(100);
  });
  it("should call the handleValueChange when change the string value", () => {
    wrapper.find(Input).at(0).prop("onChange")({
      target: { value: "newString" },
    } as ChangeEvent<HTMLInputElement>);
    expect(instance.state.structData["str"]).toEqual("newString");
  });

  it("should call the handleIpValueChange when change the ip value", () => {
    wrapper.find(Input).at(1).prop("onChange")({
      target: { value: "1.1.1.1" },
    } as ChangeEvent<HTMLInputElement>);
    expect(instance.state.structData["ip"]).toEqual("1.1.1.1");
  });
  it("should show the error message when give a invalid ip", () => {
    wrapper.find(Input).at(1).prop("onChange")({
      target: { value: "1.1.1" },
    } as ChangeEvent<HTMLInputElement>);
    expect(instance.state.showError[3]).toEqual(true);
  });
  it("should render radios group when enum's count is smaller than 6", () => {
    expect(wrapper.find(Radio.Group).length).toEqual(1);
  });
  it("should change the enum value", () => {
    wrapper.find(Radio.Group).prop("onChange")({
      target: { value: "3" },
    } as RadioChangeEvent);
    expect(instance.state.structData["enum"]).toEqual("3");
  });
  it("should change the arr value", () => {
    wrapper.find(Select).at(0).prop("onChange")(
      ["abc", "xyz"],
      expect.anything()
    );
    expect(instance.state.structData["arr"]).toEqual(["abc", "xyz"]);
  });
  it("should change the date value", () => {
    wrapper.find(DatePicker).at(0).prop("onChange")(
      moment("2019-01-01"),
      expect.anything()
    );
    expect(instance.state.structData["date"]).toEqual("2019-01-01");
  });
  it("should change the datetime value", () => {
    wrapper.find(DatePicker).at(1).prop("onChange")(
      moment("2019-01-01 23:59:59"),
      expect.anything()
    );
    expect(instance.state.structData["datetime"]).toEqual(
      "2019-01-01 23:59:59"
    );
  });
  it("should change the enums value", () => {
    wrapper.find(Select).at(1).prop("onChange")(
      ["3", "5", "7"],
      expect.anything()
    );
    expect(instance.state.structData["enums"]).toEqual(["3", "5", "7"]);
  });
  it("should render radio group", () => {
    const define = {
      id: "enum",
      name: "枚举",
      type: "enum",
      regex: ["1", "3", "5", "7", "9"],
    };
    const radioWrapper = shallow(instance.getEnumForm(define, "1"));
    expect(radioWrapper).toBeTruthy();
  });
  it("should render Select when enum", () => {
    const define = {
      id: "enum",
      name: "枚举",
      type: "enum",
      regex: ["1", "3", "5", "7", "9", "11"],
    };
    const selectWrapper = shallow(instance.getEnumForm(define, "1"));
    expect(selectWrapper).toBeTruthy();
  });

  it("should render Radio base on bool type", () => {
    const attribute: Attribute = {
      name: "结构体",
      id: "struct",
      value: {
        type: "structs",
        struct_define: [
          {
            id: "isShow",
            name: "显示",
            type: "bool",
          },
        ],
      },
    };

    const wrapper2 = shallow<AddStructModalProps>(
      <AddStructModal {...props} attribute={attribute} />
    );
    wrapper2.setProps({
      visible: true,
    });

    wrapper2.find(Radio.Group).invoke("onChange")({
      target: { value: true },
    } as RadioChangeEvent);
    expect(wrapper2.find(Radio.Group).prop("defaultValue")).toEqual(true);
  });
});
