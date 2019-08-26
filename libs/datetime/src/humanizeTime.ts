import moment from "moment";

const TIME_OFFSET = 0;

export enum HumanizeTimeFormat {
  full = "full",
  default = "default",
  relative = "relative",
  future = "future",
  accurate = "accurate",
  auto = "auto"
}

export const humanizeTime = (
  time: moment.MomentInput,
  format: HumanizeTimeFormat = HumanizeTimeFormat.auto
): string | null => {
  if (
    time === undefined ||
    time === null ||
    time === -Infinity ||
    time === Infinity
  ) {
    return null;
  }
  const m = moment(time);
  const now = moment().add(TIME_OFFSET);
  const fFull = "LL HH:mm";
  const fMedium = "LL ah:mm";
  const fShort = "MMMD日 ah:mm";
  const fShort24 = "MMMD日 HH:mm";
  const fDefault = "LL HH:mm:ss";
  const fHourMinute = "HH:mm";
  let text;

  /* 用于精确显示时间的参数
   * 今天与昨天，显示：今天（昨天）x：x的格式，如：今天12：21、昨天16：33
   * 昨天以前的时间，显示：x月x日x时：x分，如：11月23日11：22
   * 今年以前的时间，显示：x年x月x日x时：x分，如：2016年11月11日11：11
   */
  const getAccurateTime = () => {
    const diff = +m.diff(now, "days", true).toFixed(1);
    let _text = "";
    const retVal =
      m.year() < now.year()
        ? "lastYear"
        : diff < -2 || m.isBefore(now.clone().add(-1, "day"), "day")
        ? "twoDaysBefore"
        : m.isSame(now.clone().add(-1, "day"), "day")
        ? "yesterday"
        : m.isSame(now, "day")
        ? "sameDay"
        : diff < 2 && m.isSame(now.clone().add(1, "day"), "day")
        ? "nextDay"
        : diff < 7
        ? "nextWeek"
        : "default";
    switch (retVal) {
      case "sameDay":
        _text = "今天 " + m.format(fHourMinute);
        break;
      case "yesterday":
        _text = "昨天 " + m.format(fHourMinute);
        break;
      case "lastYear":
        _text = m.format(fFull);
        break;
      case "twoDaysBefore":
        _text = m.format(fShort24);
        break;
      default:
        _text = m.format(fFull);
    }

    return _text;
  };

  switch (format) {
    case HumanizeTimeFormat.full:
      text = m.format(fFull);
      break;
    case HumanizeTimeFormat.default:
      text = m.format(fDefault);
      break;
    case HumanizeTimeFormat.relative:
      text = moment.duration(Math.min(+m - +now, 0)).humanize(true);
      break;
    case HumanizeTimeFormat.future:
      text = moment.duration(Math.max(+m - +now, 0)).humanize() + "后";
      break;
    case HumanizeTimeFormat.accurate:
      text = getAccurateTime();
      break;
    default:
      text = m.format(m.year() === now.year() ? fShort : fMedium);
  }
  return text;
};
