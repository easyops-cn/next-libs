import { returnEmptyStringWhen, formatBytes } from "./util";
import { isNil } from "lodash";

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
    return formatBytesWithEmptyString(
      isNil(value) ? value : value * 1024,
      1,
      "B"
    );
  },
  diskSize(value: any) {
    return formatBytesWithEmptyString(
      isNil(value) ? value : value * 1024,
      1,
      "B"
    );
  }
};
