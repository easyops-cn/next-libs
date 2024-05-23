import { get } from "lodash";

export function getTemplateFromMap(map: Record<string, string>, key: string) {
  return map[key] || map["default"];
}

export function parseTemplate(
  template: string,
  data: Record<string, any>,
  skipUndefined = false
) {
  return template.replace(
    /#{([#A-Za-z_$][\w$]*(?:(?:\.[A-Za-z_$][\w$]*)|(?:\[[0-9]+\]))*)}/g,
    (match: string, key: string) => {
      const value = get(data, key);

      return value === undefined
        ? skipUndefined === true
          ? match
          : ""
        : value;
    }
  );
}
