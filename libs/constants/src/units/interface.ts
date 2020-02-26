export enum UnitType {
  Time = "time",
  Byte = "byte",
  ByteRate = "byteRate"
}

export interface Unit {
  id: string;
  divisor: number;
  display: string;
}
