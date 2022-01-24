import React from "react";
import { PathData } from "./util";

interface GraphicsProps {
  pathData: PathData;
  nodeLength: number;
}

export function Graphics(props: GraphicsProps): React.ReactElement {
  const {
    pathData: { paths, d },
    nodeLength,
  } = props;

  return (
    <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
      <path d={d} stroke="#D9D9D9" fill="none" strokeWidth="1" />
      {Array(5)
        .fill(undefined)
        .map((v, i, arr) => {
          const arrowLength = arr.length;
          const minDur = 5;
          let dur = nodeLength * 1;
          dur = dur > minDur ? dur : minDur;
          const interval = dur / arrowLength;
          const opacity = 1 - 0.15 * i;
          return (
            <path
              d="M0 0 L6.75 5 L0 10 L0 0 M6.75 0 L13.5 5 L6.75 10 L6.75 0"
              fill="#0b5ad9"
              fillRule="evenodd"
              transform="translate(-10, -5) "
              key={i}
              opacity={opacity}
            >
              <animateMotion
                begin={interval * i}
                dur={dur}
                repeatCount="indefinite"
                path={d}
                rotate="auto"
              />
            </path>
          );
        })}
      <rect x="0" y="0" width="27" height="10" fill="#f0f9ff" />
    </svg>
  );
}
