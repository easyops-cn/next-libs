import { shallow } from "enzyme";
import React from "react";
import { AddStruct } from "./AddStruct";
import { AddStructModal } from "./AddStructModal";
import { StructTable } from "./StructTable";
import { attribute, structData, structList } from "./mockData";
import { Button } from "antd";

describe("AddStruct", () => {
  const structsProps = {
    structData: structList,
    attribute,
    handleStoreFunction: jest.fn(),
    isLegacy: false,
  };
  const structProps = {
    structData: structData,
    attribute,
    handleStoreFunction: jest.fn(),
    isLegacy: true,
  };
  // @ts-ignore
  const structsWrapper = shallow(<AddStruct {...structsProps} />);
  // @ts-ignore
  const structWrapper = shallow(<AddStruct {...structProps} />);
  const instance = structsWrapper.instance() as AddStruct;
  const formData: any = {
    arr: [],
    str: "newString",
    int: 1,
    ip: "10.0.0.0",
    enum: "5",
    date: "2019-05-23",
    datetime: "2019-05-24 23:00:00",
  };
  it("should render", () => {
    expect(instance.state.showModal).toEqual(false);
  });
  it("should open add struct modal", () => {
    structsWrapper.find(Button).prop("onClick")(expect.anything());
    expect(instance.state.showModal).toEqual(true);
  });
  // 添加结构体
  it("should call add struct function", () => {
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    structsWrapper.find(AddStructModal).prop("handleStoreFunction")(formData);
    expect(spy).toBeCalledWith([...structList, formData]);
  });
  // 添加单结构体
  it("should call add legacy struct function", () => {
    const spy = jest.spyOn(structProps, "handleStoreFunction");
    structWrapper.find(AddStructModal).prop("handleStoreFunction")(formData);
    expect(spy).toBeCalledWith(formData);
  });
  // 编辑结构体
  it("should call edit struct function", () => {
    const spy = jest.spyOn(structsProps, "handleStoreFunction");
    structsWrapper.find(StructTable).prop("handleStoreFunction")(formData);
    expect(spy).toBeCalledWith([...structList, formData]);
  });
  // 编辑单结构体
  it("should call edit struct function", () => {
    const spy = jest.spyOn(structProps, "handleStoreFunction");
    structWrapper.find(StructTable).prop("handleStoreFunction")(formData);
    expect(spy).toBeCalledWith(formData);
  });
});
