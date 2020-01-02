import React, { useEffect, useRef, useState } from "react";
import echarts from "echarts";
import { get, merge } from "lodash";
import moment from "moment";
import { ResizeSensor } from "css-element-queries";

import { Format } from "../interfaces/panel";

import { formatValue } from "../utils/valueFormatter";

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
}

export interface TrendChartColor {
  lineColor: string;
  areaColor: string | [string, string];
}

export interface TrendChartProps {
  data: TrendChartData;
  option: TrendChartOptionProps;
  title?: string;
  yAxis?: YAxisProps;
  stack?: boolean;
  format?: Format;
  colorList?: TrendChartColor[];
  clickHandler?: (e: any) => void;
}

export function formatLabel(value: number, format: Format) {
  if (value === 0) {
    return "0";
  } else if (value) {
    if (format) {
      const [formattedValue, unit] = formatValue(value, format);
      return `${formattedValue}${unit ? " " + unit : ""}`;
    } else {
      return value.toString();
    }
  } else {
    return null;
  }
}

export function formatAxisLabel(value: number, format: Format) {
  return formatLabel(value, format);
}

export function formatMarkLineLabel(params: { value: number }, format: Format) {
  return formatLabel(params.value, format);
}

export function formatTooltip(
  format: Format,
  params: { seriesName: string; marker: string; data: any[] }[]
) {
  let tooltip = `${moment(params[0].data[0]).format(
    "YYYY/MM/DD H:mm:ss"
  )}<br />`;
  params.forEach(param => {
    const name = param.seriesName;

    let label;
    if (param.data[1] === 0) {
      label = "0";
    } else if (param.data[1]) {
      if (format) {
        const [formattedValue, unit] = formatValue(param.data[1], format);
        label = `${formattedValue}${unit ? " " + unit : ""}`;
      } else {
        label = param.data[1].toString();
      }
    } else {
      label = null;
    }

    if (label) {
      tooltip += `${param.marker}${name}: ${label}<br/>`;
    } else {
      tooltip += `${param.marker}${name}: 未知<br/>`;
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
        selectedMode: false,
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

        return {
          id: trendData.id,
          name: trendData.name,
          type: props.option.type || "line",
          data: trendData.data,
          smoothMonotone: "y",
          stack: props.stack ? "true" : null,
          symbol: "none",
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
    resizeSensor?: ResizeSensor;
  }>({});

  const renderChart = (option: any) => {
    if (!scope.echartsInstance) {
      scope.echartsInstance = echarts.init(chartRef.current);
      scope.resizeSensor = new ResizeSensor(chartRef.current, () => {
        scope.echartsInstance.resize();
      });
      if (props.clickHandler) {
        scope.echartsInstance.on("click", (e: any) => {
          props.clickHandler(e);
        });
      }
    }
    scope.echartsInstance.setOption(option);
  };

  useEffect(() => {
    const option = computeOption();
    renderChart(option);
  }, [props.data]);

  useEffect(() => {
    return () => {
      if (scope.echartsInstance) {
        scope.echartsInstance.dispose();
      }

      if (scope.resizeSensor) {
        scope.resizeSensor.detach();
      }
    };
  }, []);

  return <div className={style.chart} ref={chartRef} />;
}
