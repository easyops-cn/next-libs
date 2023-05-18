import React from "react";
import { shallow, mount } from "enzyme";
import { DatetimeRange, DATE_RANGE, SPECIFIED_DATE } from "./DatetimeRange";
import moment from "moment";
import i18n from "i18next";
import { NS_LIBS_DATETIME_COMPONENTS, K } from "../i18n/constants";

describe("DatetimeRange", () => {
  const wrapper = shallow(<DatetimeRange />);
  const component = wrapper.instance() as DatetimeRange;

  it("should work", () => {
    expect(wrapper).toBeTruthy();
  });
  it("test getButtonText now-7d", () => {
    expect(component.getButtonText()).toBe(
      i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.LAST_7_DAYS}`)
    );
  });
  it("test getButtonText now-30d", () => {
    const dateRange = {
      type: DATE_RANGE,
      value: "now-30d",
    };
    wrapper.setState({ dateRange });
    expect(component.getButtonText()).toBe(
      i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.NEARLY_30_DAYS}`)
    );
  });
  it("test getButtonText SPECIFIED_DATE", () => {
    const dateRange = {
      type: SPECIFIED_DATE,
      value: {
        from: 1556703515644,
        to: 1556789915644,
      },
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
      moment(1556789915644),
    ]);
  });

  it("test disabledDate", () => {
    expect(component.disabledDate(moment(1556703515645))).toBe(false);
  });

  it("test handleVisibleChange", () => {
    component.handleVisibleChange(true);
    expect(wrapper.state("visible")).toBe(true);
  });
});

describe("DatetimeRange selectNearDays", () => {
  const wrapper = shallow(<DatetimeRange selectNearDays={90} />);
  const component = wrapper.instance() as DatetimeRange;

  it("test disabledDate", () => {
    expect(component.disabledDate(moment().subtract(100, "days"))).toBe(true);
    expect(component.disabledDate(moment().subtract(10, "days"))).toBe(false);
    expect(component.disabledDate(moment().add(10, "days"))).toBe(true);
  });
});

describe("DatetimeRange rangeDays", () => {
  const wrapper = shallow(<DatetimeRange rangeDays={90} />);
  const component = wrapper.instance() as DatetimeRange;

  it("test disabledDate", () => {
    wrapper.setState({
      dates: [moment(), moment()],
    });
    expect(component.disabledDate(moment().add(100, "days"))).toBe(true);
    expect(component.disabledDate(moment().add(10, "days"))).toBe(false);
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
        to: 1556789915644,
      },
    };
    wrapper.setState({
      type: SPECIFIED_DATE,
      specifiedDate: [moment(1556703515644), moment(1556789915644)],
    });
    component.save();
    expect(wrapper.state("dateRange")).toEqual(dateRange);
    expect(onConfirm).toHaveBeenCalled();
  });
  it("test save dateRange", () => {
    const dateRange = {
      type: DATE_RANGE,
      value: "now-30d",
    };
    wrapper.setState({
      type: DATE_RANGE,
      range: "now-30d",
    });
    component.save();
    expect(wrapper.state("dateRange")).toEqual(dateRange);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("render custom time range", () => {
    const wrapper = mount(
      <DatetimeRange
        type="custom"
        customTimeRange={[
          {
            range: "now-30d",
            text: "近30天",
          },
          {
            range: "now-1y",
            text: "近一年",
          },
        ]}
      />
    );

    wrapper.find(".ant-btn").simulate("click");
    wrapper.update();

    expect(wrapper.find("Radio").at(0).text()).toEqual("近30天");
    expect(wrapper.find("Radio").at(1).text()).toEqual("近一年");
  });
});
