import { get } from "lodash";

import { GeneralOption, GeneralComplexOption } from "./interfaces";

export function formatOptions(
  options: GeneralOption[] = [],
  fields?: Partial<GeneralComplexOption>
) {
  return options.map(op => {
    if (typeof op === "number" || typeof op === "string") {
      return { label: op, value: op };
    }
    if (fields) {
      return {
        ...op,
        label: get(op, fields.label || "label"),
        value: get(op, fields.value || "value")
      };
    }
    return { ...op, label: op.label, value: op.value };
  }) as GeneralComplexOption[];
}
