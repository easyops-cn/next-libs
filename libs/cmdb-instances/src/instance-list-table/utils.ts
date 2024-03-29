import { isNaN, isFinite, clamp, isNil } from "lodash";
const { floor, log, abs } = Math;
import { pipes } from "@next-core/brick-utils";

export const returnEmptyStringWhen =
  (emptyCheck: any) =>
  (fn: any) =>
  (...args: any[]) => {
    if (emptyCheck(...args)) {
      return "";
    }
    return fn(...args);
  };

export const parseBytes = (
  bytes: any,
  precision = 1,
  suffix = "B",
  binary: string | boolean = "auto",
  strictBinary = false
) => {
  if (isNaN(+bytes) || !isFinite(bytes)) {
    return {
      value: "-",
      unit: "",
    };
  }
  if (bytes === 0) {
    return {
      value: 0,
      unit: suffix,
    };
  }
  if (!bytes) {
    return {
      value: "",
      unit: "",
    };
  }
  let units = ["", "K", "M", "G", "T", "P"];
  let base = 1000;
  if ((suffix === "B" && binary !== false) || binary === true) {
    base = 1024;
    if (strictBinary) {
      units = ["", "Ki", "Mi", "Gi", "Ti", "Pi"];
    }
  }
  const number = clamp(floor(log(abs(bytes)) / log(base)), 0, units.length - 1);
  const unit = units[number];
  const convertedBytes = +(bytes / base ** number);
  let toFixed = convertedBytes.toFixed(precision);
  if (toFixed.includes("e")) {
    toFixed = convertedBytes.toPrecision(precision + 1);
  }
  return {
    value: +toFixed,
    unit: `${unit}${suffix}`,
  };
};

export const formatBytes = (
  bytes: any,
  precision = 1,
  suffix = "B",
  binary: any = "auto",
  strictBinary = false
) => {
  const { value, unit } = parseBytes(
    bytes,
    precision,
    suffix,
    binary,
    strictBinary
  );
  if (unit === "") {
    return value + "";
  }
  return `${value} ${unit}`;
};

export const decimalBytes = (
  bytes: any,
  precision = 1,
  suffix = "B",
  binary = false,
  strictBinary = false
) => formatBytes(bytes, precision, suffix, binary, strictBinary);
const formatBytesWithEmptyString = returnEmptyStringWhen(isNil)(formatBytes);

export const customRules = {
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
      ? "0 KiB"
      : pipes.unitFormat(value, "KiB").join(" ");
  },
  diskSize(value: any) {
    return isNil(value)
      ? ""
      : value === 0
      ? "0 KiB"
      : pipes.unitFormat(value, "KiB").join(" ");
  },
};
