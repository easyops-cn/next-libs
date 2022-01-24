/* eslint-disable no-console */
import { sortBy, reduce } from "lodash";
import { path, Path } from "d3-path";
import { Position, Direction, RADIUS, NodeType } from "./constants";

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
  // context.moveTo(source.x, source.y);
  let controlPoint, controlPointS, controlPointT;
  switch (direction) {
    case Direction.HORIZONTAL: {
      controlPoint = { x: target.x, y: source.y };
      controlPointS = {
        x:
          controlPoint.x > source.x
            ? controlPoint.x - RADIUS
            : controlPoint.x + RADIUS,
        y: controlPoint.y,
      };
      controlPointT = {
        x: controlPoint.x,
        y:
          controlPoint.y > target.y
            ? controlPoint.y - RADIUS
            : controlPoint.y + RADIUS,
      };
      break;
    }
    case Direction.VERTICAL: {
      controlPoint = { x: source.x, y: target.y };
      controlPointS = {
        x: controlPoint.x,
        y:
          controlPoint.y > source.y
            ? controlPoint.y - RADIUS
            : controlPoint.y + RADIUS,
      };
      controlPointT = {
        x:
          controlPoint.x > target.x
            ? controlPoint.x - RADIUS
            : controlPoint.x + RADIUS,
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

export const getPathByNodes = (data: [string, HTMLElement][]): string => {
  const _data = sortBy(data, (item) => item[0]).map(([key, ele]) => {
    const x = ele.offsetLeft + ele.offsetWidth / 2;
    const y = ele.offsetTop + ele.offsetHeight / 2;
    const [stageIndex, stepIndex] = key.split(",");
    return { stageIndex, stepIndex, x, y, ele, key };
  });
  const context = path();

  reduce(
    _data,
    (source, target) => {
      if (!source) {
        context.moveTo(target.x, target.y);
      } else {
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
            return;
          }
        }
      }

      return target;
    },
    null
  );

  return context.toString();
};