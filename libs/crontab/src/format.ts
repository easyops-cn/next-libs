import cronstrue from "cronstrue/i18n";

/**
 * format a crontabTimeObj to human-readable string
 * @param minute {string} the minute part of crontab rule
 * @param hour {string} the hour part of crontab rule
 * @param date {string} the day-of-month part of crontab rule
 * @param month {string} the month part of crontab rule
 * @param dow {string} the day-of-week part of crontab rule
 * @return {string} the formatted human readable (maybe?) string
 */
function formatCrontabObject({
  minute,
  hour,
  date,
  month,
  dow
}: {
  minute: string;
  hour: string;
  date: string;
  month: string;
  dow: string;
}): string {
  const crontab = [minute, hour, date, month, dow].join(" ");
  return cronstrue.toString(crontab, { locale: "zh_CN" });
}

export default formatCrontabObject;
