export enum UnitType {
  Time = "time",
  ShortByte = "shortByte",
  ShortBibyte = "shortBibyte",
  Byte = "byte",
  Bibyte = "bibyte",
  ShortBitRates = "shortBitRates",
  ShortByteRates = "shortByteRates",
  BitRate = "bitRate",
  ByteRate = "byteRate"
}

export interface Unit {
  id: string;
  divisor: number;
  display: string;
}
