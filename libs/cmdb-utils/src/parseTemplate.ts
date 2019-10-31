import { get } from "lodash";

export function getTemplateFromMap(map: Record<string, string>, key: string) {
  return map[key] || map["default"];
}

export function parseTemplate(template: string, data: Record<string, any>) {
  return template.replace(
    /#{([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)}/g,
    (match: string, key: string) => {
      const value = get(data, key);

      return value === undefined ? "" : value;
    }
  );
}
