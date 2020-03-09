import React from "react";
import echarts from "echarts";
import { render } from "@testing-library/react";

import {
  formatLabel,
  formatAxisLabel,
  formatMarkLineLabel,
  formatTooltip,
  TrendChartData,
  TrendChart
} from "./TrendChart";

import { Format } from "../interfaces/panel";

import { FormatType } from "../constants/format";

jest.mock("echarts");

describe("TrendChart", () => {
  beforeEach(() => {
    jest.spyOn(echarts, "init").mockReturnValue({
      setOption: jest.fn(),
      resize: jest.fn(),
      dispose: jest.fn(),
      on: jest.fn()
    } as any);
  });

  it("should work", () => {
    const title = "进程内存";
    const data: TrendChartData = {
      legendList: [
        "进程占用内存 (10.0.0.5, 8079)",
        "进程占用内存 (10.0.0.6, 8079)"
      ],
      timeSeries: [1568976541, 1568976602],
      trendDataList: [
        {
          id: "进程占用内存 (10.0.0.5, 8079)",
          name: "进程占用内存 (10.0.0.5, 8079)",
          data: [
            [new Date(1568976541 * 1000), 1000],
            [new Date(1568976602 * 1000), 1000]
          ]
        },
        {
          id: "进程占用内存 (10.0.0.6, 8079)",
          name: "进程占用内存 (10.0.0.6, 8079)",
          data: [
            [new Date(1568976541 * 1000), 1200],
            [new Date(1568976602 * 1000), 1200]
          ]
        }
      ]
    };

    const result = render(
      <TrendChart
        title={title}
        data={data}
        option={{ type: "line" }}
        onChartClick={jest.fn}
      />
    );
    const asFragment = result.asFragment;
    expect(asFragment()).toMatchSnapshot();
  });

  it("should work with data of data rate format", () => {
    const title = "流量趋势";
    const data: TrendChartData = {
      legendList: ["host.net.bits_out", "host.net.bits_out"],
      timeSeries: [1569303000, 1569303060],
      trendDataList: [
        {
          id: "host.net.bits_in",
          name: "host.net.bits_in",
          data: [
            [new Date(1569303000 * 1000), 430],
            [new Date(1569303060 * 1000), 393]
          ]
        },
        {
          id: "host.net.bits_out",
          name: "host.net.bits_out",
          data: [
            [new Date(1569303000 * 1000), 57],
            [new Date(1569303060 * 1000), 57]
          ]
        }
      ]
    };
    const format: Format = {
      type: FormatType.DataRate,
      unit: "Bps"
    };

    const result = render(
      <TrendChart
        title={title}
        data={data}
        format={format}
        option={{ type: "line" }}
      />
    );
    const asFragment = result.asFragment;
    expect(asFragment()).toMatchSnapshot();
  });

  it("should format label correctlly", () => {
    let label = formatLabel(200, {
      type: FormatType.None
    });
    expect(label).toEqual("200.00");

    label = formatLabel(200, null);
    expect(label).toEqual("200");

    label = formatLabel(0.5, {
      type: FormatType.Percent,
      precision: 2
    });
    expect(label).toEqual("50.00%");

    label = formatLabel(0.5, {
      type: FormatType.Percent
    });
    expect(label).toEqual("50.00%");

    label = formatLabel(0, {
      type: FormatType.Data
    });
    expect(label).toEqual("0");

    label = formatLabel(200, {
      type: FormatType.Data
    });
    expect(label).toEqual("25.00 B");

    label = formatLabel(200, {
      type: FormatType.Data,
      precision: 2
    });
    expect(label).toEqual("25.00 B");

    label = formatLabel(null, {
      type: FormatType.Data
    });
    expect(label).toEqual(null);

    label = formatLabel(0, {
      type: FormatType.DataRate
    });
    expect(label).toEqual("0");

    label = formatLabel(200, {
      type: FormatType.DataRate
    });
    expect(label).toEqual("25.00 Bps");

    label = formatLabel(200, {
      type: FormatType.DataRate,
      precision: 2
    });
    expect(label).toEqual("25.00 Bps");

    label = formatLabel(null, {
      type: FormatType.DataRate
    });
    expect(label).toEqual(null);
  });

  it("should format axis label correctlly", () => {
    const label = formatAxisLabel(200, {
      type: FormatType.None
    });
    expect(label).toEqual("200.00");
  });

  it("should format markLine label correctlly", () => {
    const label = formatMarkLineLabel(
      {
        value: 200
      },
      {
        type: FormatType.None
      }
    );
    expect(label).toEqual("200.00");
  });

  it("should format tooltip correctlly", () => {
    let toolTip = formatTooltip(
      {
        type: FormatType.None
      },
      [
        {
          seriesName: "host.net.bits_in__sum",
          marker: "<span></span>",
          data: [new Date(1559750400 * 1000), 254],
          color: "green"
        }
      ]
    );
    expect(toolTip).toEqual(
      '2019/06/06 0:00:00<br /><svg width="15px" height="10px"><circle cx="10" cy="5" r="4" stroke="white" stroke-width="1" fill="green" /></svg> host.net.bits_in__sum: 254.00<br/>'
    );

    toolTip = formatTooltip(
      {
        type: FormatType.None
      },
      [
        {
          seriesName: "host.net.bits_in__sum",
          marker: "<span></span>",
          data: [new Date(1559750400 * 1000), null],
          color: "red"
        }
      ]
    );
    expect(toolTip).toEqual(
      '2019/06/06 0:00:00<br /><svg width="15px" height="10px"><circle cx="10" cy="5" r="4" stroke="white" stroke-width="1" fill="red" /></svg> host.net.bits_in__sum: 未知<br/>'
    );
  });
});
