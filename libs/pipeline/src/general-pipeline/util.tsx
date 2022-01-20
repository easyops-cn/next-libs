import { sortBy, reduce } from "lodash";

const hasStep = ({
  preStageIndex,
  preStepIndex,
  curStageIndex,
  curStepIndex,
}: any): boolean => {
  return preStageIndex !== curStageIndex && preStepIndex !== curStepIndex;
};

const getStepNodes = ({ preX, preY, curX, curY }: any) => {
  const middle = (preX + curX) / 2;
  const stepA = { x: middle, y: preY };
  const stepB = { x: middle, y: curY };

  return [stepA, stepB];
};

export const getPathByNodes = (data: any) => {
  const _data = sortBy(data, (item) => item[0]);
  const radius = 8;
  const nodes: any[] = [];
  let d = "";
  reduce(
    _data,
    (pre, cur, index) => {
      const [curKey, curEle] = cur;
      const [curStageIndex, curStepIndex] = curKey.split(",");
      const curX = curEle.offsetLeft + curEle.offsetWidth / 2;
      const curY = curEle.offsetTop + curEle.offsetHeight / 2;

      if (pre) {
        const [preKey, preEle] = pre;
        const [preStageIndex, preStepIndex] = preKey.split(",");
        const _hasStep = hasStep({
          preStageIndex,
          preStepIndex,
          curStageIndex,
          curStepIndex,
        });
        if (_hasStep) {
          const preX = preEle.offsetLeft + preEle.offsetWidth / 2;
          const preY = preEle.offsetTop + preEle.offsetHeight / 2;
          const stepNodes = getStepNodes({ preX, preY, curX, curY });
          stepNodes.map((node) =>
            nodes.push({
              type: "stepNode",
              ...node,
            })
          );

          const [stepNodeA, stepNodeB] = stepNodes;
          const lineA = `L${stepNodeA.x - radius} ${stepNodeA.y}`;
          const bezierA = `Q${stepNodeA.x} ${stepNodeA.y} ${stepNodeA.x} ${
            stepNodeA.y - radius
          }`;
          const lineB = `L${stepNodeB.x} ${stepNodeB.y + radius}`;
          const bezierB = `Q${stepNodeB.x} ${stepNodeB.y} ${
            stepNodeB.x + radius
          } ${stepNodeB.y}`;
          d = d.concat(lineA, bezierA, lineB, bezierB);
        }
      }

      nodes.push({
        type: "dataNode",
        stageIndex: curStageIndex,
        stepIndex: curStepIndex,
        x: curX,
        y: curY,
      });
      const dAction = index === 0 ? "M" : "L";
      const instruction = `${dAction}${curX} ${curY}`;
      d = d.concat(instruction);

      return cur;
    },
    null
  );

  return d;
};
