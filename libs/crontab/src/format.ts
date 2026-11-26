import cronstrue from "cronstrue/i18n";
import { NS_CRONTAB, K } from "./i18n/constants";
import i18n from "i18next";
import { addResourceBundle } from "./i18n";
addResourceBundle();

/**
 * 当分钟为单个数字时，把小时表达式中的纯范围（如 `1-5`）展开为枚举（如 `1,2,3,4,5`）。
 *
 * 背景：cronstrue 对「分钟单值 + 小时范围」的表达式（如 `0 1-5 * * *`）生成
 * 「每小时, 在 01:00 和 05:59 之间」式的描述，中文语境下极易被误读为
 * 「每分钟在 01:00 到 05:59 之间」；展开为枚举后 cronstrue 会生成
 * 「在 01:00, 02:00, ... 和 05:00」式的无歧义描述，与手写枚举的表达式完全一致。
 *
 * 仅处理无步进的纯数字范围；含 `*`、`/` 的表达式及非法范围保持原样，
 * 交给 cronstrue 按原有逻辑描述。
 */
function expandHourRanges(minute: string, hour: string): string {
  if (!/^\d{1,2}$/.test(minute.trim())) {
    // 分钟不是单值（*、范围、步进、列表等）时不展开，cronstrue 原描述无歧义
    return hour;
  }
  if (hour.includes("*") || hour.includes("/")) {
    return hour;
  }
  const expanded = hour.split(",").map((part) => {
    const match = part.trim().match(/^(\d{1,2})-(\d{1,2})$/);
    if (!match) {
      return part;
    }
    const start = parseInt(match[1], 10);
    const end = parseInt(match[2], 10);
    if (start > end || start < 0 || end > 23) {
      return part;
    }
    const values: number[] = [];
    for (let h = start; h <= end; h += 1) {
      values.push(h);
    }
    return values.join(",");
  });
  // 0-23 等价于每小时
  const result = expanded.join(",");
  return result === "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23"
    ? "*"
    : result;
}
/**
 * format a crontabTimeObj to human-readable string
 * @param minute {string} the minute part of crontab rule
 * @param hour {string} the hour part of crontab rule
 * @param date {string} the day-of-month part of crontab rule
 * @param month {string} the month part of crontab rule
 * @param dow {string} the day-of-week part of crontab rule
 * @return {string} the formatted human readable (maybe?) string
 */
function formatCrontabObject(
  {
    minute,
    hour,
    date,
    month,
    dow,
  }: {
    minute: string;
    hour: string;
    date: string;
    month: string;
    dow: string;
  },
  customWeekFormat?: boolean
): string {
  const isEn = i18n.language && i18n.language.split("-")[0] === "en";

  const crontab = [
    minute,
    expandHourRanges(minute, hour),
    date,
    month,
    dow,
  ].join(" ");
  const crontabString = cronstrue.toString(crontab, {
    locale: isEn ? "en" : "zh_CN",
  });
  const crontabList = crontabString.split(",");
  const weekString = crontabList[2];
  const enWeekList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]; //参考https://github.com/bradymholt/cRonstrue/blob/main/src/i18n/locales/en.ts中的daysOfTheWeek
  const firstWeek = isEn
    ? enWeekList.find((l) => weekString?.indexOf(l) > -1)
    : "星期";
  if (
    customWeekFormat &&
    date !== "*" &&
    weekString?.includes(firstWeek)
    //https://github.com/bradymholt/cRonstrue/blob/main/src/expressionDescriptor.ts，具体可以查看getFullDescription函数中description的生成；description += timeSegment + dayOfMonthDesc + dayOfWeekDesc + monthDesc + yearDesc，dayOfMonthDesc在date为*并且dow不为*时，是空字符串。
  ) {
    /*
    https://pubs.opengroup.org/onlinepubs/007904975/utilities/crontab.html
    Finally, if either the month or day of month is specified as an element or list, and the day of week is also specified as an element or list, then any day matching either the month and day of month, or the day of week, shall be matched.
    */
    crontabList[2] =
      i18n.t(`${NS_CRONTAB}:${K.OR_MONTHLY}`) +
      weekString.substring(weekString.indexOf(firstWeek));
    return crontabList.join(",");
  } else {
    return crontabString;
  }
}

export default formatCrontabObject;
