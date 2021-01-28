import { find } from "lodash";
import { getRuntime } from "@next-core/brick-kit";

const getShowKey = () => {
  return getRuntime().getFeatureFlags()["config-show-key"];
};

export const getInstanceNameKey = (
  objectId: string,
  model: any = "",
  showKey = getShowKey()
) => {
  if (
    showKey &&
    model &&
    model.view &&
    model.view.show_key &&
    model.view.show_key.length > 0
  ) {
    return model.view.show_key;
  } else {
    return objectId === "HOST" ? "hostname" : "name";
  }
};

export const getInstanceName = (
  instanceData: any,
  objectId: any,
  modelList: any[] = []
) => {
  const instanceModel = find(modelList, (model) => model.objectId === objectId);
  const showKey = getInstanceNameKey(objectId, instanceModel);
  if (Array.isArray(showKey)) {
    const showName = showKey
      .map((key, index) => {
        if (index === 0) {
          return instanceData[key];
        } else {
          return instanceData[key] ? "(" + instanceData[key] + ")" : "";
        }
      })
      .join("");
    return showName;
  } else {
    return instanceData[showKey];
  }
};
