import React from "react";
import { mount, shallow } from "enzyme";
import { GeneralPipeline, GeneralPipelineProps } from "./";
import { AddStepButton } from "./AddStepButton";
import { StepItem } from "./StepItem";

const stageConfig = [
  {
    color: "#B4A9F4",
    stageName: "监控目标",
    icon: {
      lib: "fa",
      icon: "address-book",
      prefix: "fas",
    },
    key: "first",
    addStepButton: {
      name: "first-add",
      key: "first-add",
      disabled: false,
    },
  },
  {
    color: "#8092FF",
    stageName: "告警条件",
    icon: {
      lib: "fa",
      icon: "address-book",
      prefix: "fas",
    },
    key: "second",
    addStepButton: {
      name: "second-add",
      key: "second-add",
      disabled: false,
      subButtons: [
        {
          name: "su1",
          key: "su1",
          disabled: false,
        },
        {
          name: "su2",
          key: "su2",
          disabled: false,
        },
        {
          name: "su3",
          key: "su3",
          disabled: true,
        },
      ],
    },
  },
] as GeneralPipelineProps["stageConfig"];

const dataSource = {
  first: [
    {
      title: "first-a",
      icon: {
        lib: "fa",
        icon: "address-book",
        prefix: "fas",
      },
      color: "#9AA2FB",
      data: { first: "a" },
      key: "first-a",
    },
    {
      title: "first-b",
      icon: {
        lib: "fa",
        icon: "address-book",
        prefix: "fas",
      },
      color: "#9AA2FB",
      data: { first: "b" },
      key: "first-b",
    },
  ],
  second: [
    {
      title: "second-a",
      icon: {
        lib: "fa",
        icon: "address-book",
        prefix: "fas",
      },
      color: "#7EEDD7",
      data: { second: "a" },
      key: "second-a",
      disabled: true,
    },
    {
      title: "second-b",
      icon: {
        lib: "fa",
        icon: "address-book",
        prefix: "fas",
      },
      color: "#7EEDD7",
      data: { second: "b" },
      key: "second-b",
    },
  ],
} as GeneralPipelineProps["dataSource"];

const renderOperates = (data: any) =>
  [
    {
      icon: {
        lib: "antd",
        icon: "minus-circle",
        theme: "outlined",
      },
      key: "operate-aa",
      disabled: false,
    },
    {
      icon: {
        lib: "antd",
        icon: "minus-circle",
        theme: "outlined",
      },
      key: "operate-bb",
      tooltip: "tooltip",
      disabled: true,
    },
  ] as any;

describe("GeneralPipeline", () => {
  it("should work", () => {
    const onOperateClick = jest.fn();
    const onAddStepClick = jest.fn();
    const wrapper = shallow(
      <GeneralPipeline
        stageConfig={stageConfig}
        dataSource={dataSource}
        renderOperates={renderOperates}
        onOperateClick={onOperateClick}
        onAddStepClick={onAddStepClick}
      />
    );
    expect(wrapper.find(".stageHeaderItem")).toHaveLength(2);
    expect(wrapper.find(".stageItemWrapper")).toHaveLength(2);

    wrapper.find(StepItem).at(0).invoke("onStepItemClick")({
      hasOperateButtons: true,
      disabled: false,
    });
    expect(onOperateClick).not.toBeCalled();
    wrapper.find(StepItem).at(0).invoke("onStepItemClick")({
      hasOperateButtons: false,
      disabled: false,
    });
    expect(onOperateClick).lastCalledWith(null, { first: "a" });

    wrapper.find(StepItem).at(0).invoke("onOperateButtonClick")({ key: "a" });
    expect(onOperateClick).lastCalledWith({ key: "a" }, { first: "a" });

    wrapper.find(AddStepButton).at(0).invoke("onAddStepButtonClick")({
      hasSubButtons: true,
      key: "b",
    });
    expect(onAddStepClick).not.toBeCalled();
    wrapper.find(AddStepButton).at(0).invoke("onAddStepButtonClick")({
      hasSubButtons: false,
      key: "b",
    });
    expect(onAddStepClick).lastCalledWith({ key: "b" });

    wrapper.find(AddStepButton).at(0).invoke("onSubButtonClick")({
      key: ["a", "sub"],
    });
    expect(onAddStepClick).lastCalledWith({ key: ["a", "sub"] });
  });
});
