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
        label: (op as any)[fields.label || "label"],
        value: (op as any)[fields.value || "value"]
      };
    }
    return { label: op.label, value: op.value };
  }) as GeneralComplexOption[];
}
