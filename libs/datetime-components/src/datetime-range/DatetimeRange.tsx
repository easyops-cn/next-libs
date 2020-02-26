import React from "react";
import { Popover, Button, Radio, DatePicker, Icon } from "antd";
import { find, get } from "lodash";
import { RadioChangeEvent } from "antd/lib/radio";
import { TooltipPlacement } from "antd/lib/tooltip";
import moment from "moment";
import { RangePickerValue } from "antd/lib/date-picker/interface";

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
}

export interface DatatimeRangeState {
  dateRange: DateRange | SpecifiedDateRange;
  type: SpecifiedDateType | DateRangeType;
  range: string | null;
  specifiedDate: RangePickerValue | null;
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
    text: "近1小时"
  },
  {
    range: "now-1d",
    text: "近24小时"
  },
  {
    range: "now/d",
    text: "今天"
  },
  {
    range: "now-7d",
    text: "近7天"
  },
  {
    range: "now-30d",
    text: "近30天"
  }
];

export class DatetimeRange extends React.Component<
  DatatimeRangeProps,
  DatatimeRangeState
> {
  static defaultProps = {
    type: "default",
    customTimeRange: [] as RangeText[]
  };

  rangeOptionList: RangeText[];
  constructor(props: DatatimeRangeProps) {
    super(props);

    const defaultInitRange = {
      type: DATE_RANGE,
      value: "now-7d"
    };

    const customInitRange = {
      type: DATE_RANGE,
      value: get(this.props.customTimeRange, "[0].range")
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
      format: this.props.format || "YYYY-MM-DD HH:mm:ss"
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
      value: e.target.value
    };
    this.setState({
      dateRange,
      type: DATE_RANGE,
      range: e.target.value,
      specifiedDate: null
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
      visible: false
    });
  };

  save = () => {
    let dateRange: DateRange | SpecifiedDateRange;
    if (this.state.type === DATE_RANGE) {
      dateRange = {
        type: this.state.type,
        value: this.state.range
      };
    } else {
      dateRange = {
        type: this.state.type,
        value: {
          from: +this.state.specifiedDate[0],
          to: +this.state.specifiedDate[1]
        }
      };
    }
    this.setState({ dateRange });
    this.props.onConfirm?.(dateRange);
    this.hide();
  };

  onDateChange = (v: RangePickerValue) => {
    this.setState({
      type: SPECIFIED_DATE,
      range: null,
      specifiedDate: v
    });
  };

  render(): React.ReactNode {
    const labelStyle = {
      display: "block",
      color: "#262626",
      lineHeight: "24px",
      fontSize: "16px",
      fontWeight: 500,
      marginBottom: "10px"
    };
    const radioGroupStyle = {
      marginBottom: "20px"
    };
    const datePickerStyle = {
      marginBottom: "30px"
    };
    const contentStyle = {
      margin: "16px"
    };
    const content = (
      <div style={contentStyle}>
        <div style={labelStyle}>快速选择：</div>
        <Radio.Group
          value={this.state.range}
          onChange={this.handleRangeChange}
          style={radioGroupStyle}
          className="btnGroup"
        >
          {this.rangeOptionList.map(item => (
            <Radio.Button
              value={item.range}
              key={item.range}
              className={item.range}
            >
              {item.text}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div style={labelStyle}>指定范围：</div>
        <div style={datePickerStyle}>
          <DatePicker.RangePicker
            showTime={{
              defaultValue: [
                moment(this.state.format),
                moment(this.state.format)
              ]
            }}
            format={this.state.format}
            style={{ width: "380px" }}
            placeholder={["开始日期", "结束日期"]}
            value={this.state.specifiedDate}
            onChange={this.onDateChange}
            allowClear={false}
          />
        </div>
        <Button type="primary" onClick={this.save}>
          确定
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
        <Button>
          <Icon type="clock-circle" style={{ verticalAlign: "middle" }} />{" "}
          {this.getButtonText()}
        </Button>
      </Popover>
    );
  }
}
