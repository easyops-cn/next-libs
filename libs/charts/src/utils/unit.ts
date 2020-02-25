import { dataUnits } from "./data";
import { dataRateUnits } from "./dataRate";
import { times } from "./time";
import { Unit, UnitType } from "./interface";

export const UNIT_MAP: { [k in UnitType]: Unit[] } = {
  [UnitType.Time]: times,
  [UnitType.Byte]: dataUnits,
  [UnitType.ByteRate]: dataRateUnits
};

export * from "./interface";
