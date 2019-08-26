import { isNil, findIndex, chain } from "lodash";
import moment from "moment";

export const costTime = (cost: number, start?: any, end?: any) => {
  // 某些后台接口任务初始时 `end` 为 "0001-01-01T00:00:00Z"
  if (isNil(cost) && (isNil(end) || end === "0001-01-01T00:00:00Z")) {
    return "";
  }

  if (isNil(cost)) {
    cost = moment(end).diff(start);
  }

  cost = Math.max(cost, 0);

  const milliseconds = cost % 1000;
  const seconds = Math.floor(cost / 1000) % 60;
  const minutes = Math.floor(cost / 60000) % 60;
  const hours = Math.floor(cost / 3600000) % 24;
  const days = Math.floor(cost / 86400000);

  const list = [
    {
      count: days,
      unit: "天"
    },
    {
      count: hours,
      unit: "小时"
    },
    {
      count: minutes,
      unit: "分钟"
    },
    {
      count: seconds,
      unit: "秒"
    },
    {
      count: milliseconds,
      unit: "毫秒"
    }
  ];

  const index = findIndex(list, function(item) {
    return item.count > 0;
  });

  // 如果小于 1 分钟，统一只显示 `秒`
  if (index >= 3 || index === -1) {
    // 如果小于 0.1 秒，取 3 位小数，否则取 1 位小数
    return +(cost / 1000).toFixed(cost >= 100 ? 1 : 3) + " 秒";
  }
  // 否则，统一显示为最大的两个且不为 0 的单位
  return chain(list.slice(index, index + 2))
    .filter(function(item) {
      return item.count > 0;
    })
    .map(function(item) {
      return item.count + " " + item.unit;
    })
    .value()
    .join(" ");
};
