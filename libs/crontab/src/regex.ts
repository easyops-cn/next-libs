const getCrontabRegex = function (
  replacement: string,
  numbers?: string,
  isDate?: boolean
): RegExp {
  const splitRegexTemplate = "^(%s(,%s)*)$";
  // numbers 用于 月份和星期的数字部分
  const elementRegexTemplate = "\\*(\\/(?!0)%n)?|%s-%s(\\/(?!0)%n)?|%s";

  let elementRegex = elementRegexTemplate
    .replace(/%n/g, `(${numbers || replacement})`)
    .replace(/%s/g, `(${replacement})`);
  isDate ? (elementRegex = elementRegex + "|L") : "";

  return new RegExp(
    splitRegexTemplate.replace(/%s/g, `(${elementRegex})`),
    "i"
  );
};

export default {
  minute: getCrontabRegex("[0-5]?\\d"),
  hour: getCrontabRegex("[01]?\\d|2[0-3]"),
  date: getCrontabRegex("0?[1-9]|[12]\\d|3[01]", null, true),
  month: getCrontabRegex(
    "[1-9]|1[012]|[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]un|[jJ]ul|[aA]ug|[sS]ep|[oO]ct|[nN]ov|[dD]ec",
    "[1-9]|1[012]"
  ),
  dow: getCrontabRegex(
    "[0-6]|[mM]on|[tT]ue|[wW]ed|[tT]hu|[fF]ri|[sS]at|[sS]un",
    "[0-6]"
  ),
};
