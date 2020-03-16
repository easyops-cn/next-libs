import React, { useEffect, useRef, useState } from "react";
import echarts from "echarts";
import ResizeObserver from "resize-observer-polyfill";

import { get, merge } from "lodash";
import moment from "moment";

import { Format } from "../interfaces/panel";

import { formatValue } from "../utils/valueFormatter";

import { DataStatus } from "../constants/data";

import style from "./TrendChart.module.css";

export interface TrendData {
  id: string;
  name: string;
  data: any[];
}

export interface TrendChartData {
  timeSeries: number[];
  legendList: string[];
  trendDataList: TrendData[];
}

export interface YAxisProps {
  name?: string;
}

export interface TrendChartOptionProps {
  type: "line" | "bar";
  yAxis?: {
    minInterval?: number;
  };
  symbolSize?: number;
}

export interface TrendChartColor {
  lineColor: string;
  areaColor: string | [string, string];
}

export interface TrendChartClickEventParams {
  dataIndex: number;
  data: any;
}

export interface TrendChartProps {
  status?: DataStatus;
  data?: TrendChartData;
  error?: string;
  option: TrendChartOptionProps;
  title?: string;
  yAxis?: YAxisProps;
  stack?: boolean;
  format?: Format;
  colorList?: TrendChartColor[];
  onChartClick?: (e: TrendChartClickEventParams) => void;
}

export function formatLabel(value: number, format: Format): string {
  if (value === 0) {
    return "0";
  } else if (value) {
    const [formattedValue, unit] = formatValue(value, format);
    return `${formattedValue}${unit ? " " + unit : ""}`;
  } else {
    return null;
  }
}

export function formatAxisLabel(value: number, format: Format): string {
  return formatLabel(value, format);
}

export function formatMarkLineLabel(
  params: { value: number },
  format: Format
): string {
  return formatLabel(params.value, format);
}

export function formatTooltip(
  format: Format,
  params: { seriesName: string; marker: string; data: any[]; color: string }[]
): string {
  let tooltip = `${moment(params[0].data[0]).format(
    "YYYY/MM/DD H:mm:ss"
  )}<br />`;
  params.forEach(param => {
    const name = param.seriesName;

    let label;
    if (param.data[1] === 0) {
      label = "0";
    } else if (param.data[1]) {
      const [formattedValue, unit] = formatValue(param.data[1], format);
      label = `${formattedValue}${unit ? " " + unit : ""}`;
    } else {
      label = null;
    }

    const marker = `<svg width="15px" height="10px"><circle cx="10" cy="5" r="4" stroke="white" stroke-width="1" fill="${param.color}" /></svg>`;
    if (label) {
      tooltip += `${marker} ${name}: ${label}<br/>`;
    } else {
      tooltip += `${marker} ${name}: 未知<br/>`;
    }
  });
  return tooltip;
}

export function TrendChart(props: TrendChartProps): React.ReactElement {
  const colorList: TrendChartColor[] = props.colorList || [
    {
      lineColor: "rgba(47, 194, 91, 1)",
      areaColor: ["rgba(47, 194, 91, 0.3)", "rgba(47, 194, 91, 0.3)"]
    },
    {
      lineColor: "rgba(255, 186, 0, 1)",
      areaColor: ["rgba(255, 186, 0, 0.3)", "rgba(255, 186, 0, 0.3)"]
    },
    {
      lineColor: "rgba(0, 113, 235, 1)",
      areaColor: ["rgba(0, 113, 235, 0.3)", "rgba(0, 113, 235, 0.3)"]
    },
    {
      lineColor: "rgba(63, 76, 129, 1)",
      areaColor: ["rgba(63, 76, 129, 0.3)", "rgba(63, 76, 129, 0.3)"]
    },
    {
      lineColor: "rgba(41, 199, 204, 1)",
      areaColor: ["rgba(41, 199, 204, 0.3)", "rgba(41, 199, 204, 0.3)"]
    },
    {
      lineColor: "rgba(255, 162, 53, 1)",
      areaColor: ["rgba(255, 162, 53, 0.3)", "rgba(255, 162, 53, 0.3)"]
    },
    {
      lineColor: "rgba(133, 67, 224, 1)",
      areaColor: ["rgba(133, 67, 224, 0.3)", "rgba(133, 67, 224, 0.3)"]
    },
    {
      lineColor: "rgba(240, 73, 60, 1)",
      areaColor: ["rgba(240, 73, 60, 0.3)", "rgba(240, 73, 60, 0.3)"]
    }
  ];

  const chartRef = useRef();

  const computeOption = () => {
    const option = {
      grid: {
        top: get(props.yAxis, "name") ? 70 : 50,
        bottom: 40,
        left: "left",
        right: 35,
        containLabel: true
      },
      title: {
        text: props.title,
        x: "left",
        left: 0,
        padding: [5, 0],
        textStyle: {
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(38, 38, 38, 1)"
        }
      },
      legend: {
        data: props.data.legendList,
        left: "center",
        bottom: 0,
        align: "left",
        selectedMode: true,
        icon: "path://L0,0 L5,0 M5,0 12,0 12,1 5,1",
        textStyle: {
          fontSize: 12,
          fontWeight: 400,
          color: "rgba(140, 140, 140, 1)"
        }
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none"
          }
        },
        right: 30
      },
      xAxis: {
        type: "time",
        data: props.data.timeSeries,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: "rgba(217, 217, 217, 1)"
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: "rgba(89, 89, 89, 1)"
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: "value",
        name: get(props.yAxis, "name"),
        nameTextStyle: {
          fontSize: 12,
          color: "rgba(89, 89, 89, 1)"
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          padding: [0, 0, 0, 20],
          showMinLabel: true,
          showMaxLabel: true,
          color: "rgba(89, 89, 89, 1)",
          formatter: (value: number) => formatAxisLabel(value, props.format)
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "rgba(232, 232, 232, 1)"
          }
        }
      },
      series: props.data.trendDataList.map((trendData, index) => {
        const color = colorList[index % colorList.length];

        trendData.data.forEach(data => {
          if (!(data[0] instanceof Date)) {
            data[0] = new Date(data[0]);
          }
        });

        return {
          id: trendData.id,
          name: trendData.name,
          type: props.option.type || "line",
          data: trendData.data,
          smoothMonotone: "y",
          stack: props.stack ? "true" : null,
          symbol: "none",
          symbolSize: props.option.symbolSize ?? 0,
          markLine: {
            label: {
              formatter: (params: any) =>
                formatMarkLineLabel(params, props.format)
            }
          },
          itemStyle: {
            color: color.lineColor
          },
          lineStyle: {
            width: 0.5
          },
          areaStyle: color.areaColor && {
            normal: {
              color: Array.isArray(color.areaColor)
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: color.areaColor[0]
                    },
                    {
                      offset: 1,
                      color: color.areaColor[1]
                    }
                  ])
                : color.areaColor
            }
          }
        };
      }),
      tooltip: {
        trigger: "axis",
        formatter: (params: any[]) => {
          return formatTooltip(props.format, params);
        },
        textStyle: {
          fontSize: 12
        }
      }
    };

    const formatOption: any = {};

    merge(option, formatOption);
    merge(option, props.option);

    return option;
  };

  const [scope] = useState<{
    echartsInstance?: echarts.ECharts;
    resizeObserver?: ResizeObserver;
  }>({});

  const renderChart = (option: any): void => {
    if (!scope.echartsInstance) {
      scope.echartsInstance = echarts.init(chartRef.current);

      if (props.onChartClick) {
        scope.echartsInstance.on(
          "click",
          (params: TrendChartClickEventParams) => {
            props.onChartClick(params);
          }
        );
      }

      scope.resizeObserver = new ResizeObserver(() => {
        scope.echartsInstance.resize();
      });

      scope.resizeObserver.observe(chartRef.current);
    }
    scope.echartsInstance.setOption(option);
  };

  useEffect(() => {
    if (props.status === undefined || props.status === DataStatus.Normal) {
      renderChart(computeOption());
    }
  }, [props.data]);

  useEffect(
    () => () => {
      if (scope.echartsInstance) {
        scope.echartsInstance.dispose();
      }
    },
    []
  );

  const render = (): React.ReactElement => {
    const status =
      props.status === undefined ? DataStatus.Normal : props.status;
    const title = props.title || "";
    switch (status) {
      case DataStatus.Normal:
        return <div className={style.chart} ref={chartRef} />;
      case DataStatus.Empty:
        return (
          <>
            <div className={style.title}>{title}</div>
            <div>暂无数据</div>
          </>
        );
      case DataStatus.ApiError:
        return (
          <>
            <div className={style.title}>{title}</div>
            <div>获取数据失败</div>
          </>
        );
      default:
        return (
          <>
            <div className={style.title}>{title}</div>
            <div>{props.error || "未知错误"}</div>
          </>
        );
    }
  };

  return render();
}
