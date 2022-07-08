import React from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Popover, Button, Radio, DatePicker } from "antd";
import { find, get } from "lodash";
import { RadioChangeEvent } from "antd/lib/radio";
import { TooltipPlacement } from "antd/lib/tooltip";
import moment from "moment";
import { RangeValue } from "rc-picker/lib/interface";
import { ButtonSize } from "antd/lib/button";
import i18n from "i18next";
import { NS_LIBS_DATETIME_COMPONENTS, K } from "../i18n/constants";
import { addResourceBundle } from "../i18n";
addResourceBundle();

export type DateRangeType = "dateRange";
export const DATE_RANGE = "dateRange";
export type SpecifiedDateType = "specifiedDate";
export const SPECIFIED_DATE = "specifiedDate";

export interface SpecifiedDateValue {
  from: number;
  to: number;
}

export interface DateRange {
  type: DateRangeType;
  value: string;
}
export interface SpecifiedDateRange {
  type: SpecifiedDateType;
  value: SpecifiedDateValue;
}

export type RangeType = "default" | "custom";

export interface DatatimeRangeProps {
  initDateRange?: DateRange | SpecifiedDateRange;
  onConfirm?(dateRange: DateRange | SpecifiedDateRange): void;
  format?: string;
  type?: RangeType;
  customTimeRange?: RangeText[];
  placement?: TooltipPlacement;
  size?: ButtonSize;
  selectNearDays?: number;
}

export interface DatatimeRangeState {
  dateRange: DateRange | SpecifiedDateRange;
  type: SpecifiedDateType | DateRangeType;
  range: string | null;
  specifiedDate: RangeValue<moment.Moment> | null;
  visible: boolean;
  format: string;
}

export interface RangeText {
  range: string;
  text: string;
}

export const defaultRangeOptionList: RangeText[] = [
  {
    range: "now-1h",
    text: i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.NEARLY_AN_HOUR}`),
  },
  {
    range: "now-1d",
    text: i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.NEARLY_24_HOURS}`),
  },
  {
    range: "now/d",
    text: i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.TODAY}`),
  },
  {
    range: "now-7d",
    text: i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.LAST_7_DAYS}`),
  },
  {
    range: "now-30d",
    text: i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.NEARLY_30_DAYS}`),
  },
];

export class DatetimeRange extends React.Component<
  DatatimeRangeProps,
  DatatimeRangeState
> {
  static defaultProps = {
    type: "default",
    customTimeRange: [] as RangeText[],
  };

  rangeOptionList: RangeText[];
  constructor(props: DatatimeRangeProps) {
    super(props);

    const defaultInitRange = {
      type: DATE_RANGE,
      value: "now-7d",
    };

    const customInitRange = {
      type: DATE_RANGE,
      value: get(this.props.customTimeRange, "[0].range"),
    };
    const initDateRange: DateRange | SpecifiedDateRange =
      this.props.initDateRange ||
      ((this.props.type === "default"
        ? defaultInitRange
        : customInitRange) as DateRange);

    this.rangeOptionList =
      this.props.type === "default"
        ? defaultRangeOptionList
        : this.props.customTimeRange;
    this.state = {
      dateRange: initDateRange,
      type: initDateRange.type,
      range: initDateRange.type === DATE_RANGE ? initDateRange.value : null,
      specifiedDate:
        initDateRange.type === SPECIFIED_DATE
          ? [moment(initDateRange.value.from), moment(initDateRange.value.to)]
          : null,
      visible: false,
      format: this.props.format || "YYYY-MM-DD HH:mm:ss",
    };
  }

  getButtonText() {
    if (this.state.dateRange.type === DATE_RANGE) {
      return find(this.rangeOptionList, ["range", this.state.dateRange.value])
        .text;
    } else {
      return (
        moment(this.state.dateRange.value.from).format(this.state.format) +
        " - " +
        moment(this.state.dateRange.value.to).format(this.state.format)
      );
    }
  }

  handleRangeChange = (e: RadioChangeEvent) => {
    const dateRange: DateRange = {
      type: DATE_RANGE,
      value: e.target.value,
    };
    this.setState({
      dateRange,
      type: DATE_RANGE,
      range: e.target.value,
      specifiedDate: null,
    });
    if (this.props.onConfirm) {
      this.props.onConfirm(dateRange);
    }
    this.hide();
  };

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  save = () => {
    let dateRange: DateRange | SpecifiedDateRange;
    if (this.state.type === DATE_RANGE) {
      dateRange = {
        type: this.state.type,
        value: this.state.range,
      };
    } else {
      dateRange = {
        type: this.state.type,
        value: {
          from: +this.state.specifiedDate[0],
          to: +this.state.specifiedDate[1],
        },
      };
    }
    this.setState({ dateRange });
    this.props.onConfirm?.(dateRange);
    this.hide();
  };

  onDateChange = (v: RangeValue<moment.Moment>) => {
    this.setState({
      type: SPECIFIED_DATE,
      range: null,
      specifiedDate: v,
    });
  };
  disabledDate = (current: moment.Moment) => {
    if (!this.props.selectNearDays) {
      return false;
    }
    const tooSelectNearDays =
      current <= moment().subtract(this.props.selectNearDays, "days") ||
      current > moment().endOf("day");
    return !!tooSelectNearDays;
  };

  render(): React.ReactNode {
    const labelStyle = {
      display: "block",
      color: "var(--datetime-selector-label-color, var(--text-color-title))",
      lineHeight: "24px",
      fontSize: "16px",
      fontWeight: 500,
      marginBottom: "10px",
    };
    const radioGroupStyle = {
      marginBottom: "20px",
    };
    const datePickerStyle = {
      marginBottom: "30px",
    };
    const contentStyle = {
      margin: "16px",
    };
    const content = (
      <div style={contentStyle}>
        <div style={labelStyle}>
          {i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.QUICK_SELECTION}`)}：
        </div>
        <Radio.Group
          value={this.state.range}
          onChange={this.handleRangeChange}
          style={radioGroupStyle}
          buttonStyle="solid"
          className="btnGroup"
        >
          {this.rangeOptionList.map((item) => (
            <Radio.Button
              value={item.range}
              key={item.range}
              className={item.range}
            >
              {item.text}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div style={labelStyle}>
          {i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.SPECIFIED_RANGE}`)}：
        </div>
        <div style={datePickerStyle}>
          <DatePicker.RangePicker
            showTime={{
              defaultValue: [moment(), moment()],
            }}
            format={this.state.format}
            style={{ width: "380px" }}
            placeholder={[
              i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.START_DATE}`),
              i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.END_DATE}`),
            ]}
            value={this.state.specifiedDate}
            onChange={this.onDateChange}
            allowClear={false}
            disabledDate={this.disabledDate}
          />
        </div>
        <Button type="primary" onClick={this.save}>
          {i18n.t(`${NS_LIBS_DATETIME_COMPONENTS}:${K.CONFIRM}`)}
        </Button>
      </div>
    );
    return (
      <Popover
        placement={this.props.placement ?? "bottom"}
        content={content}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Button size={this.props.size}>
          <ClockCircleOutlined style={{ verticalAlign: "middle" }} />{" "}
          {this.getButtonText()}
        </Button>
      </Popover>
    );
  }
}
