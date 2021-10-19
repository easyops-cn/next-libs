import { pointer, select } from "d3-selection";
import { getTargetVertex } from "./getTargetVertex";

jest.mock("d3-selection");
jest.mock("./getNearestControlPoint", () => ({
  getNearestControlPoint() {
    return "right";
  },
}));

describe("getTargetVertex", () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 160,
      height: 208,
    })) as any;
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  const root = document.createElement("div");
  const nodeWrapper = document.createElement("div");
  nodeWrapper.classList.add("nodeWrapper");
  const inner = document.createElement("div");
  root.appendChild(nodeWrapper);
  nodeWrapper.appendChild(inner);
  const targetNode = {
    originalData: {},
    x: 5,
    y: 10,
  };
  const updateTargetControlPoint = jest.fn();

  (select as jest.Mock).mockReturnValue({
    datum() {
      return targetNode;
    },
  });

  (pointer as jest.Mock).mockReturnValue([150, 100]);

  it.each<
    [
      desc: string,
      input: Parameters<typeof getTargetVertex>[0],
      output: ReturnType<typeof getTargetVertex>
    ]
  >([
    [
      "over a node other than the source node",
      {
        event: {
          sourceEvent: {
            target: inner,
          } as any,
        },
        nodeWrapperClassName: "nodeWrapper",
        sourceVertex: {
          node: {},
        } as any,
        drawingLinkContainer: null,
        updateTargetControlPoint,
      },
      {
        node: targetNode,
        control: "right",
        left: 5,
        top: 10,
        width: 160,
        height: 208,
        x: 160,
        y: 114,
      },
    ],
    [
      "over no node",
      {
        event: {
          sourceEvent: {
            target: null,
          } as any,
        },
        nodeWrapperClassName: "nodeWrapper",
        sourceVertex: {
          node: {},
        } as any,
        drawingLinkContainer: null,
        updateTargetControlPoint,
      },
      {
        x: 150,
        y: 100,
      },
    ],
    [
      "over the source node",
      {
        event: {
          sourceEvent: {
            target: inner,
          } as any,
        },
        nodeWrapperClassName: "nodeWrapper",
        sourceVertex: {
          node: targetNode,
        } as any,
        drawingLinkContainer: null,
        updateTargetControlPoint,
      },
      {
        x: 150,
        y: 100,
      },
    ],
  ])("should work %s", (desc, input, output) => {
    expect(getTargetVertex(input)).toEqual(output);
  });
});
