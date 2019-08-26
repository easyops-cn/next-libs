import React from "react";
import { shallow } from "enzyme";
import { DatetimeRange, DATE_RANGE, SPECIFIED_DATE } from "./DatetimeRange";
import moment from "moment";

describe("DatetimeRange", () => {
  const wrapper = shallow(<DatetimeRange />);
  const component = wrapper.instance() as DatetimeRange;
  it("should work", () => {
    expect(wrapper).toMatchSnapshot();
  });
  it("test getButtonText now-7d", () => {
    expect(component.getButtonText()).toBe("近7天");
  });
  it("test getButtonText now-30d", () => {
    const dateRange = {
      type: DATE_RANGE,
      value: "now-30d"
    };
    wrapper.setState({ dateRange });
    expect(component.getButtonText()).toBe("近30天");
  });
  it("test getButtonText SPECIFIED_DATE", () => {
    const dateRange = {
      type: SPECIFIED_DATE,
      value: {
        from: 1556703515644,
        to: 1556789915644
      }
    };
    wrapper.setState({ dateRange });
    expect(component.getButtonText()).toBe(
      "2019-05-01 17:38:35 - 2019-05-02 17:38:35"
    );
  });
  it("test onDateChange", () => {
    component.onDateChange([moment(1556703515644), moment(1556789915644)]);
    expect(wrapper.state("type")).toBe(SPECIFIED_DATE);
    expect(wrapper.state("range")).toBe(null);
    expect(wrapper.state("specifiedDate")).toEqual([
      moment(1556703515644),
      moment(1556789915644)
    ]);
  });
  it("test handleVisibleChange", () => {
    component.handleVisibleChange(true);
    expect(wrapper.state("visible")).toBe(true);
  });
});
describe("DatetimeRange onConfirm", () => {
  const onConfirm = jest.fn();
  const wrapper = shallow(<DatetimeRange onConfirm={onConfirm} />);
  const component = wrapper.instance() as DatetimeRange;
  it("test save SpecifiedDateRange", () => {
    const dateRange = {
      type: SPECIFIED_DATE,
      value: {
        from: 1556703515644,
        to: 1556789915644
      }
    };
    wrapper.setState({
      type: SPECIFIED_DATE,
      specifiedDate: [moment(1556703515644), moment(1556789915644)]
    });
    component.save();
    expect(wrapper.state("dateRange")).toEqual(dateRange);
    expect(onConfirm).toHaveBeenCalled();
  });
  it("test save dateRange", () => {
    const dateRange = {
      type: DATE_RANGE,
      value: "now-30d"
    };
    wrapper.setState({
      type: DATE_RANGE,
      range: "now-30d"
    });
    component.save();
    expect(wrapper.state("dateRange")).toEqual(dateRange);
    expect(onConfirm).toHaveBeenCalled();
  });
});
