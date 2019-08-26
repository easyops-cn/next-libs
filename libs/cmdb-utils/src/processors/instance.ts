import { CmdbModels } from "@sdk/cmdb-sdk";
import { DefaultNameKey } from "../constants";
import _ from "lodash";

export function getInstanceNameKeys(
  object?: Partial<CmdbModels.ModelCmdbObject>
) {
  return object && object.view && object.view.show_key
    ? object.view.show_key
    : [DefaultNameKey];
}
