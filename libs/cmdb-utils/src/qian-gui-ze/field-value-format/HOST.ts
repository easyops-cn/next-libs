import { returnEmptyStringWhen, formatBytes } from "./util";
import { isNil } from "lodash";
import { pipes } from "@next-core/brick-utils";

const formatBytesWithEmptyString = returnEmptyStringWhen(isNil)(formatBytes);
export default {
  cpuHz(value: any) {
    return formatBytesWithEmptyString(
      isNil(value) ? value : value * 1000 * 1000,
      1,
      "Hz"
    );
  },
  memSize(value: any) {
    return isNil(value)
      ? ""
      : value === 0
      ? "0 KB"
      : pipes.unitFormat(value, "KB").join(" ");
  },
  diskSize(value: any) {
    return isNil(value)
      ? ""
      : value === 0
      ? "0 KB"
      : pipes.unitFormat(value, "KB").join(" ");
  },
};
