import { getNearestControlPoint } from "./getNearestControlPoint";

describe("getNearestControlPoint", () => {
  it.each<
    [
      Parameters<typeof getNearestControlPoint>[0],
      ReturnType<typeof getNearestControlPoint>
    ]
  >([
    [
      {
        x: 10,
        y: 10,
        width: 20,
        height: 200,
      },
      "top",
    ],
    [
      {
        x: 19,
        y: 100,
        width: 20,
        height: 200,
      },
      "right",
    ],
    [
      {
        x: 10,
        y: 190,
        width: 20,
        height: 200,
      },
      "bottom",
    ],
    [
      {
        x: 1,
        y: 100,
        width: 20,
        height: 200,
      },
      "left",
    ],
  ])("should work", (input, output) => {
    expect(getNearestControlPoint(input)).toEqual(output);
  });
});
