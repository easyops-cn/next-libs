import { path } from "d3-path";
import { Direction, Position } from "./constants";
import {
  getPosition,
  getControlPoint,
  drawPolylineWithRoundedCorners,
  drawStepWithRoundedCorners,
  getPathByNodes,
  getPointByProportion,
} from "./util";

const consoleError = jest.fn();
window.console.error = consoleError;

(SVGElement as any).prototype.getTotalLength = jest.fn();
(SVGElement as any).prototype.getPointAtLength = jest.fn();

const data1 = [
  {
    source: { x: 50, y: 50 },
    target: { x: 0, y: 0 },
  },
  {
    source: { x: 50, y: 50 },
    target: { x: 100, y: 0 },
  },
  {
    source: { x: 50, y: 50 },
    target: { x: 0, y: 100 },
  },
  {
    source: { x: 50, y: 50 },
    target: { x: 100, y: 100 },
  },
];

const data2 = [
  {
    stageIndex: 0,
    stepIndex: 0,
    x: 110,
    y: 105,
  },
  {
    stageIndex: 1,
    stepIndex: 0,
    x: 210,
    y: 105,
  },
  {
    stageIndex: 1,
    stepIndex: 1,
    x: 210,
    y: 205,
  },
  {
    stageIndex: 2,
    stepIndex: 0,
    x: 310,
    y: 105,
  },
];

describe("util", () => {
  afterEach(() => {
    consoleError.mockClear();
  });

  it("getPosition should work", () => {
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 50, y: 50 } })
    ).toEqual(Position.COINCIDE);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 0, y: 0 } })
    ).toEqual(Position.LT);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 100, y: 0 } })
    ).toEqual(Position.RT);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 0, y: 100 } })
    ).toEqual(Position.LB);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 100, y: 100 } })
    ).toEqual(Position.RB);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 100, y: 50 } })
    ).toEqual(Position.R);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 0, y: 50 } })
    ).toEqual(Position.L);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 50, y: 100 } })
    ).toEqual(Position.B);
    expect(
      getPosition({ source: { x: 50, y: 50 }, target: { x: 50, y: 0 } })
    ).toEqual(Position.T);
  });

  it("getControlPoint should work", () => {
    expect(
      getControlPoint({ source: { x: 0, y: 0 }, target: { x: 100, y: 100 } })
    ).toEqual({ x: 50, y: 50 });
    expect(
      getControlPoint({
        source: { x: 0, y: 0 },
        target: { x: 100, y: 100 },
        ratio: { x: 0.2, y: 0.3 },
      })
    ).toEqual({ x: 20, y: 30 });
  });

  it("drawPolylineWithRoundedCorners should work", () => {
    const horizontalResult = data1.map((v) => {
      const context = path();
      context.moveTo(v.source.x, v.source.y);
      drawPolylineWithRoundedCorners({ ...v, context });
      return context.toString();
    });
    expect(horizontalResult).toEqual([
      "M50,50L8,50Q0,50,0,42L0,0",
      "M50,50L92,50Q100,50,100,42L100,0",
      "M50,50L8,50Q0,50,0,58L0,100",
      "M50,50L92,50Q100,50,100,58L100,100",
    ]);

    const verticalResult = data1.map((v) => {
      const context = path();
      context.moveTo(v.source.x, v.source.y);
      drawPolylineWithRoundedCorners({
        ...v,
        context,
        direction: Direction.VERTICAL,
      });
      return context.toString();
    });
    expect(verticalResult).toEqual([
      "M50,50L50,8Q50,0,42,0L0,0",
      "M50,50L50,8Q50,0,58,0L100,0",
      "M50,50L50,92Q50,100,42,100L0,100",
      "M50,50L50,92Q50,100,58,100L100,100",
    ]);

    drawPolylineWithRoundedCorners({
      ...data1[0],
      context: path(),
      direction: "unknown" as any,
    });
    expect(consoleError).toBeCalledTimes(1);
  });

  it("drawStepWithRoundedCorners should work", () => {
    const horizontalResult = data1.map((v) => {
      const context = path();
      context.moveTo(v.source.x, v.source.y);
      drawStepWithRoundedCorners({ ...v, context });
      return context.toString();
    });
    expect(horizontalResult).toEqual([
      "M50,50L33,50Q25,50,25,42L25,25L25,8Q25,0,17,0L0,0",
      "M50,50L67,50Q75,50,75,42L75,25L75,8Q75,0,83,0L100,0",
      "M50,50L33,50Q25,50,25,58L25,75L25,92Q25,100,17,100L0,100",
      "M50,50L67,50Q75,50,75,58L75,75L75,92Q75,100,83,100L100,100",
    ]);

    const verticalResult = data1.map((v) => {
      const context = path();
      context.moveTo(v.source.x, v.source.y);
      drawStepWithRoundedCorners({
        ...v,
        context,
        direction: Direction.VERTICAL,
      });
      return context.toString();
    });
    expect(verticalResult).toEqual([
      "M50,50L50,33Q50,25,42,25L25,25L8,25Q0,25,0,17L0,0",
      "M50,50L50,33Q50,25,58,25L75,25L92,25Q100,25,100,17L100,0",
      "M50,50L50,67Q50,75,42,75L25,75L8,75Q0,75,0,83L0,100",
      "M50,50L50,67Q50,75,58,75L75,75L92,75Q100,75,100,83L100,100",
    ]);

    drawStepWithRoundedCorners({
      ...data1[0],
      context: path(),
      direction: "unknown" as any,
    });
    expect(consoleError).toBeCalledTimes(1);
  });

  it("getPathByNodes should work", () => {
    expect(getPathByNodes(data2).paths).toHaveLength(data2.length - 1);
    expect(getPathByNodes(data2).d).toEqual(
      "M110,105L210,105M210,105L210,205M210,205L252,205Q260,205,260,197L260,155L260,113Q260,105,268,105L310,105"
    );
  });

  it("getPointByProportion should work", () => {
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathElement.setAttribute("d", "M0,0 L100,100");
    getPointByProportion(pathElement, 0.5);
  });
});
