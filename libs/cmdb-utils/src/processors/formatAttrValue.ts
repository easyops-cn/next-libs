import { customRules } from "../qian-gui-ze/field-value-format";
import * as _ from "lodash";
import { getInstanceNameKey } from "../qian-gui-ze/getInstanceName";

export const formatAttrValue = (value: any, attr: any, objectId: string) => {
  if (objectId === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      "formatAttrValue need third argument to be modelData.objectId, console will throw on later version, please pass in objectId"
    );
  }
  // short-circuit on custom format rules
  if (objectId in customRules && attr.id in customRules[objectId]) {
    if (!_.isBoolean(value) && (value || value === 0)) {
      value = _.compact(value.toString().split(" "));
      const valStr = value
        .map((item: any) => {
          return customRules[objectId][attr.id](item, attr);
        })
        .join(" ");
      return valStr === "" ? undefined : valStr;
    }
    return customRules[objectId][attr.id](value, attr);
  }
  if (_.isNil(value)) {
    return "";
  }
  let display;
  // 老的外键结构兼容
  switch (_.get(attr, "value.type")) {
    case "FK":
      // 对于单实例，cmdb-p 返回的是 `{...}`
      // 而 cmdb-resource 返回的是 [{...}]
      display = _.isArray(value)
        ? _.map(value, getFkAttrDisplay(attr)).join("; ")
        : getFkAttrDisplay(attr)(value) || "";
      break;
    case "FKs":
      display = _.map(value, getFkAttrDisplay(attr)).join("; ");
      break;
    case "arr":
    case "enums":
      display = _.join(value, "; ");
      break;
    case "struct":
    case "structs":
      display = _.isEmpty(value)
        ? ""
        : _.isObject(value)
        ? JSON.stringify(value)
        : value;
      break;
    case "enum":
      display = _.isArray(value)
        ? _.map(value, (v) => {
            return v.value;
          }).join(" | ")
        : value + "";
      break;
    case "json":
      display = _.isObject(value) ? JSON.stringify(value) : value;
      break;
    default:
      display = value + "";
  }

  if ("relation_id" in attr) {
    display = _.map(value, getFkAttrDisplay(attr)).join("; ");
  }
  return display;
};

function getFkAttrDisplay(attr: any) {
  return function (item: any) {
    // 兼容老数据
    if (!_.has(attr, "relation_view")) {
      attr.relation_view = [
        getInstanceNameKey(_.get(attr, "value.rule.obj")),
        ..._.get(attr, "view.visibleExternals", []),
      ];
    }
    const rightObjectId = _.get(attr, "value.rule.obj", attr.right_object_id);
    let [name, ext] = attr.relation_view;
    let text = "";
    if (!_.has(item, name)) {
      // 内联数据有可能没有 `name`，例如应用的包列表
      if (Object.prototype.hasOwnProperty.call(attr.value, "external")) {
        name =
          _.chain(attr.value.external)
            .map((val) => val.org_attr)
            .reject(
              (attrName) =>
                !Object.prototype.hasOwnProperty.call(item, attrName)
            )
            .first()
            .value() || _.first(_.keys(item));
        text = formatAttrValue(item[name], { id: name }, rightObjectId);
      } else {
        text = "";
      }
    } else {
      // todo: 这里用了取巧的方法去拼一个可以对属性生效的 attr 定义：{ id: name }, 目前后台还不支持关系对端还要显示一层关系，以后如果支持了，这里需要想办法根据正经的模型属性定义来渲染
      text = formatAttrValue(item[name], { id: name }, rightObjectId);
    }
    if (ext) {
      if (
        Object.prototype.hasOwnProperty.call(item, ext) &&
        !_.isNil(item[ext])
      ) {
        text +=
          "(" + formatAttrValue(item[ext], { id: ext }, rightObjectId) + ")";
      } else if (text === "") {
        text = "-";
      }
    }
    return text;
  };
}
