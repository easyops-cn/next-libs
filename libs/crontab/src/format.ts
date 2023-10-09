import cronstrue from "cronstrue/i18n";
import { NS_CRONTAB, K } from "./i18n/constants";
import i18n from "i18next";

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

  const crontab = [minute, hour, date, month, dow].join(" ");
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
