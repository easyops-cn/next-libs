import { i18nText } from "@next-core/brick-kit";
import {
  PropertyType,
  UnionPropertyType,
  BrickProperties,
  ItemModeType,
} from "../interfaces";
import { safeDump, JSON_SCHEMA, safeLoad } from "js-yaml";
import { omit, isEmpty, groupBy } from "lodash";
import {
  supportBasicType,
  supportMenuType,
  OTHER_FORM_ITEM_FIELD,
  commonProps,
  groupI18nMap,
} from "./constant";

export function isAdvanceMode(value: unknown): boolean {
  if (
    typeof value === "string" &&
    (value.startsWith("<%") || value.includes("${"))
  ) {
    return true;
  }

  return false;
}

export function mergeProperties(
  propertyList: PropertyType[] = [],
  brickProperties: BrickProperties = {}
): UnionPropertyType[] {
  return propertyList?.map((item) => ({
    ...item,
    value: brickProperties?.[item.name],
    mode: isAdvanceMode(brickProperties?.[item.name])
      ? ItemModeType.Advanced
      : ItemModeType.Normal,
  }));
}

export function yamlStringify(value: unknown, indent = 2): string {
  return safeDump(value, {
    indent,
    schema: JSON_SCHEMA,
    skipInvalid: true,
    noRefs: true,
    noCompatMode: true,
  });
}

export function yaml(value: string): any {
  return safeLoad(value, { schema: JSON_SCHEMA, json: true });
}

export function matchNoramlMenuValue(value: unknown): unknown {
  if (typeof value === "string") {
    const reg = /<% APP\.getMenu\((.*)\) %>/;
    return value.match(reg)?.[1]?.replace(/'|"/g, "") || value;
  }
  return value;
}

function calcMenuValue(value: string): string {
  if (typeof value === "string") {
    if (value.startsWith("<%")) {
      return value;
    }
    return `<% APP.getMenu('${value}') %>`;
  }
  return value;
}

export function calculateValue(
  propertyList: PropertyType[] = [],
  brickProperties: BrickProperties = {},
  typeList: UnionPropertyType[] = []
): Record<string, any> {
  const othersValue: Record<string, any> = {};
  for (const [key, value] of Object.entries(brickProperties)) {
    const find = propertyList.find((item) => item.name === key);
    if (!find) {
      othersValue[key] = value;
    }
  }

  const processValue = propertyList.reduce((obj: any, item) => {
    const v = brickProperties[item.name];
    obj[item.name] = v;
    if (v !== undefined) {
      if (
        !supportBasicType.concat(supportMenuType).includes(item.type as string)
      ) {
        obj[item.name] = yamlStringify(v);
      }

      if (supportMenuType.includes(item.type as string)) {
        const selected = typeList.find(
          (typeItem) => typeItem.name === item.name
        );
        if (selected?.mode === ItemModeType.Advanced) {
          obj[item.name] = v;
        } else {
          obj[item.name] = matchNoramlMenuValue(v);
        }
      }
    }
    return obj;
  }, {});

  return {
    ...processValue,
    [OTHER_FORM_ITEM_FIELD]: isEmpty(othersValue)
      ? ""
      : yamlStringify(othersValue),
  };
}

/**
 * @description 判断是否用使用 yaml 把用户输入解析成 JSON 的模式，当前只有以下情况下会进行解析，其他情况不对数据进行处理
 *  1. 当前属性的类型不是内置支持的类型
 *  2. 当前属性虽然是支持的类型，但是当前切换到高级模式编辑
 *  3. 不是构件本身申明的属性，为 html 共有的通用属性，目前统一放在 others 的编辑器中
 * @param field  字段值
 * @param typeList  属性列表包含每个属性的类型和当前编辑模式
 * @return boolean
 */

export function isUseYamlParse(
  field: { key: string; value: any },
  typeList: UnionPropertyType[]
): boolean {
  if (typeof field.value !== "string") return false;

  if (field.key === OTHER_FORM_ITEM_FIELD) return true;

  const find = typeList?.find((item) => item.name === field.key);

  if (find) {
    if (
      supportMenuType.includes(find.type as string) &&
      find.mode !== ItemModeType.Advanced
    )
      return false;

    const isBasicType = supportBasicType.includes(find.type as string);

    if (isBasicType && find.mode === ItemModeType.Advanced) return true;

    if (!isBasicType) return true;
  }

  return false;
}

export function isUseMenuParse(
  field: { key: string; value: any },
  typeList: UnionPropertyType[]
): boolean {
  const item = typeList.find((item) => item.name === field.key);
  if (supportMenuType.includes(item?.type as string)) {
    return true;
  }
  return false;
}

export function processFormValue(
  values = {},
  typeList: UnionPropertyType[]
): Record<string, any> {
  const formData: Record<string, any> = {};
  for (const [key, value] of Object.entries(values)) {
    if (isUseYamlParse({ key, value }, typeList)) {
      formData[key] = yaml(value as any);
    } else if (isUseMenuParse({ key, value }, typeList)) {
      formData[key] = calcMenuValue(value as string);
    } else {
      formData[key] = value;
    }
  }

  return {
    ...omit(formData, OTHER_FORM_ITEM_FIELD),
    ...(isEmpty(formData[OTHER_FORM_ITEM_FIELD])
      ? {}
      : formData[OTHER_FORM_ITEM_FIELD]),
  };
}

export function groupByType(
  typeList: UnionPropertyType[] = []
): Array<[string, UnionPropertyType[]]> {
  const normals = typeList.filter((item) => item.group !== "other");
  const others = typeList.filter((item) => item.group === "other");

  return Object.entries(
    groupBy(normals.concat(others), (item) => {
      const group = item.group || "basic";
      const groupI18N: Record<string, any> = {
        ...groupI18nMap,
        ...item.groupI18N,
      };
      const i18nData = groupI18N && groupI18N[group];
      if (i18nData) {
        return i18nText(i18nData);
      }

      return group;
    })
  );
}

export function extractCommonProps(typeList: PropertyType[]): PropertyType[] {
  if (isEmpty(typeList)) return [];

  return commonProps.concat(typeList);
}
