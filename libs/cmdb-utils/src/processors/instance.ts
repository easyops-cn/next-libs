import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { DefaultNameKey } from "../constants";
import _ from "lodash";

export function getInstanceNameKeys(
  object?: Partial<CmdbModels.ModelCmdbObject>
): string[] {
  if (object) {
    const defaultNameKey =
      object.objectId === "HOST" ? "hostname" : DefaultNameKey;
    return object.view && object.view.show_key
      ? object.view.show_key
      : [defaultNameKey];
  } else {
    return [DefaultNameKey];
  }
}
