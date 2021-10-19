import { ControlPointPair } from "../interfaces";
import { adoptLink } from "./adoptLink";

describe("adoptLink", () => {
  const source = {
    top: 10,
    left: 20,
    width: 30,
    height: 40,
  };
  const target = {
    top: 55,
    left: 200,
    width: 30,
    height: 40,
  };
  const baseOptions = {
    linkOffsetStart: 3,
    linkOffsetEnd: 5,
    cornerRadius: 4,
  };

  it.each<
    [
      prefer: ControlPointPair,
      result: ReturnType<typeof adoptLink>,
      resultWithDefaultOptions: ReturnType<typeof adoptLink>
    ]
  >([
    [
      undefined,
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["bottom", "top"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["right", "left"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["right", "left"],
        path: "M50,30C125,30,125,75,200,75",
      },
    ],
    [
      ["left", "right"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["right", "top"],
      {
        direction: ["right", "top"],
        path: "M53 30H211a4 4 0 0 1 4 4L215 50",
      },
      {
        direction: ["right", "top"],
        path: "M50 30H215a0 0 0 0 1 0 0L215 55",
      },
    ],
    [
      ["left", "top"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["top", "left"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["bottom", "left"],
      {
        direction: ["bottom", "left"],
        path: "M35 53V71a4 4 0 0 0 4 4L195 75",
      },
      {
        direction: ["bottom", "left"],
        path: "M35 50V75a0 0 0 0 0 0 0L200 75",
      },
    ],
    [
      ["right", "bottom"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["left", "bottom"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["top", "right"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
    [
      ["bottom", "right"],
      {
        direction: ["right", "left"],
        path: "M53,30C124,30,124,75,195,75",
      },
      {
        direction: ["bottom", "top"],
        path: "M35,50C35,52.5,215,52.5,215,55",
      },
    ],
  ])(
    "should work for %j",
    (preferDirection, result, resultWithDefaultOptions) => {
      expect(
        adoptLink(
          {
            source,
            target,
            preferDirection,
          },
          baseOptions
        )
      ).toEqual(result);
      expect(
        adoptLink({
          source,
          target,
          preferDirection,
        })
      ).toEqual(resultWithDefaultOptions);
    }
  );
});
