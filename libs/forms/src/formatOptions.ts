import { GeneralOption, GeneralComplexOption } from "./interfaces";

export function formatOptions(options: GeneralOption[] = []) {
  return options.map(op => {
    if (typeof op === "number" || typeof op === "string") {
      return { label: op, value: op };
    }

    return { label: op.label, value: op.value };
  }) as GeneralComplexOption[];
}
