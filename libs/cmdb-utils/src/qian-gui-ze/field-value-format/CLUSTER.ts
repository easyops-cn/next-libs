import { id2label } from "../clusterType";
import { returnEmptyStringWhen } from "./util";
import { isNil } from "lodash";

export default {
  type(value: any) {
    return returnEmptyStringWhen(isNil)(id2label)(value);
  }
};
