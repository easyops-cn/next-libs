import { shortBytes, shortBibytes, bytes, bibytes } from "./bytes";
import {
  shortBitRates,
  shortByteRates,
  bitRates,
  byteRates
} from "./byteRates";
import { times } from "./times";
import { Unit, UnitType } from "./interface";

export const UNIT_MAP: { [k in UnitType]: Unit[] } = {
  [UnitType.Time]: times,
  [UnitType.ShortByte]: shortBytes,
  [UnitType.ShortBibyte]: shortBibytes,
  [UnitType.Byte]: bytes,
  [UnitType.Bibyte]: bibytes,
  [UnitType.ShortBitRates]: shortBitRates,
  [UnitType.ShortByteRates]: shortByteRates,
  [UnitType.BitRate]: bitRates,
  [UnitType.ByteRate]: byteRates
};
