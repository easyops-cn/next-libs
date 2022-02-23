/* eslint-disable no-console */
import { reduce } from "lodash";
import { path, Path } from "d3-path";
import {
  Position,
  Direction,
  RADIUS,
  NodeType,
  PathData,
  PathType,
} from "./constants";

const { min, abs } = Math;

export const getPosition = ({
  source,
  target,
}: {
  source: NodeType;
  target: NodeType;
}): Position => {
  const { x: sourceX, y: sourceY } = source;
  const { x: targetX, y: targetY } = target;
  const xDirection = targetX > sourceX ? "R" : targetX < sourceX ? "L" : "";
  const yDirection = targetY > sourceY ? "B" : targetY < sourceY ? "T" : "";
  const position = `${xDirection}${yDirection}` as Position;
  return position || Position.COINCIDE;
};

export const getControlPoint = ({
  source,
  target,
  ratio = { x: 0.5, y: 0.5 },
}: {
  source: NodeType;
  target: NodeType;
  ratio?: { x: number; y: number };
}): NodeType => {
  const { x: sourceX, y: sourceY } = source;
  const { x: targetX, y: targetY } = target;
  return {
    x: targetX * ratio.x + sourceX * (1 - ratio.x),
    y: targetY * ratio.y + sourceY * (1 - ratio.y),
  };
};

export const drawPolylineWithRoundedCorners = ({
  source,
  target,
  context,
  direction = Direction.HORIZONTAL,
}: {
  source: NodeType;
  target: NodeType;
  context: Path;
  direction?: Direction;
}): void => {
  let controlPoint, controlPointS, controlPointT;
  switch (direction) {
    case Direction.HORIZONTAL: {
      controlPoint = { x: target.x, y: source.y };
      const _radius = min(
        RADIUS,
        abs(controlPoint.x - source.x),
        abs(controlPoint.y - target.y)
      );
      controlPointS = {
        x:
          controlPoint.x > source.x
            ? controlPoint.x - _radius
            : controlPoint.x + _radius,
        y: controlPoint.y,
      };
      controlPointT = {
        x: controlPoint.x,
        y:
          controlPoint.y > target.y
            ? controlPoint.y - _radius
            : controlPoint.y + _radius,
      };
      break;
    }
    case Direction.VERTICAL: {
      controlPoint = { x: source.x, y: target.y };
      const _radius = min(
        RADIUS,
        abs(controlPoint.x - target.x),
        abs(controlPoint.y - source.y)
      );
      controlPointS = {
        x: controlPoint.x,
        y:
          controlPoint.y > source.y
            ? controlPoint.y - _radius
            : controlPoint.y + _radius,
      };
      controlPointT = {
        x:
          controlPoint.x > target.x
            ? controlPoint.x - _radius
            : controlPoint.x + _radius,
        y: controlPoint.y,
      };
      break;
    }
    default: {
      console.error(
        `Unknown direction: ${direction}\n`,
        "source: ",
        source,
        "target: ",
        target
      );
      context.moveTo(target.x, target.y);
      return;
    }
  }
  context.lineTo(controlPointS.x, controlPointS.y);
  context.quadraticCurveTo(
    controlPoint.x,
    controlPoint.y,
    controlPointT.x,
    controlPointT.y
  );
  context.lineTo(target.x, target.y);
};

export const drawStepWithRoundedCorners = ({
  source,
  target,
  context,
  direction = Direction.HORIZONTAL,
}: {
  source: NodeType;
  target: NodeType;
  context: Path;
  direction?: Direction;
}): void => {
  const controlPoint = getControlPoint({ source, target });
  switch (direction) {
    case Direction.HORIZONTAL: {
      drawPolylineWithRoundedCorners({
        source,
        target: controlPoint,
        context,
        direction: Direction.HORIZONTAL,
      });
      drawPolylineWithRoundedCorners({
        source: controlPoint,
        target,
        context,
        direction: Direction.VERTICAL,
      });
      break;
    }
    case Direction.VERTICAL: {
      drawPolylineWithRoundedCorners({
        source,
        target: controlPoint,
        context,
        direction: Direction.VERTICAL,
      });
      drawPolylineWithRoundedCorners({
        source: controlPoint,
        target,
        context,
        direction: Direction.HORIZONTAL,
      });
      break;
    }
    default: {
      console.error(
        `Unknown direction: ${direction}\n`,
        "source: ",
        source,
        "target: ",
        target
      );
      context.moveTo(target.x, target.y);
      return;
    }
  }
};

export const getPathByNodes = (data: NodeType[]): PathData => {
  let d = "";
  const paths: PathType[] = [];
  reduce(
    data,
    (source, target) => {
      if (source) {
        const context = path();
        context.moveTo(source.x, source.y);
        const position = getPosition({ source, target });
        switch (position) {
          case Position.L:
          case Position.R:
          case Position.B:
          case Position.T: {
            context.lineTo(target.x, target.y);
            break;
          }
          case Position.LT:
          case Position.LB:
          case Position.RT:
          case Position.RB: {
            drawStepWithRoundedCorners({
              source,
              target,
              context,
              direction: Direction.HORIZONTAL,
            });
            break;
          }
          // istanbul ignore next
          default: {
            console.error(
              `Unknown position: ${position}\n`,
              "source: ",
              source,
              "target: ",
              target
            );
            context.moveTo(target.x, target.y);
          }
        }
        const dPath = context.toString();
        const pathElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        pathElement.setAttribute("d", dPath);

        paths.push({
          path: context,
          pathElement,
          source,
          target,
        });
        d = d.concat(dPath);
      }

      return target;
    },
    null as NodeType
  );

  return { paths, d };
};

export const getPointByProportion = (
  element: SVGPathElement,
  proportion: number
): DOMPoint => {
  return element.getPointAtLength(element.getTotalLength() * proportion);
};
