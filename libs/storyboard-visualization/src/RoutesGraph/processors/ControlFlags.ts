import { ControlPoint } from "..";

export const CoordBit = 1;
export const SignBit = 2;

export enum Coord {
  X = 0,
  Y = CoordBit,
}

export enum Sign {
  POSITIVE = 0,
  NEGATIVE = SignBit,
}

export const ControlFlags: Record<ControlPoint, number> = {
  top: Coord.Y | Sign.NEGATIVE,
  right: Coord.X | Sign.POSITIVE,
  bottom: Coord.Y | Sign.POSITIVE,
  left: Coord.X | Sign.NEGATIVE,
};
