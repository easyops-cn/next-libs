import { adoptLink } from "./adoptLink";
import { updateDrawingLink } from "./updateDrawingLink";

jest.mock("./adoptLink");

describe("updateDrawingLink", () => {
  (adoptLink as jest.Mock).mockReturnValue({
    path: "M9 9",
  });

  it.each<
    [
      input: Parameters<typeof updateDrawingLink>[0],
      path: string,
      marker: string,
      snapped: boolean
    ]
  >([
    [
      {
        sourceVertex: {
          x: 1,
          y: 2,
        } as any,
        targetVertex: {
          node: {},
          control: "top",
        } as any,
        linkSnappedClassName: "linkSnapped",
        drawingLink: {
          attr: jest.fn(),
          classed: jest.fn(),
        } as any,
        arrowMarkerId: "arrow-marker",
        drawingArrowMarkerId: "drawing-arrow-marker",
      },
      "M9 9",
      "drawing-arrow-marker",
      true,
    ],
    [
      {
        sourceVertex: {
          x: 1,
          y: 2,
        } as any,
        targetVertex: {
          x: 2,
          y: 3,
        },
        linkSnappedClassName: "linkSnapped",
        drawingLink: {
          attr: jest.fn(),
          classed: jest.fn(),
        } as any,
        arrowMarkerId: "arrow-marker",
        drawingArrowMarkerId: "drawing-arrow-marker",
      },
      "M1 2L2 3",
      "arrow-marker",
      false,
    ],
  ])("should work", (input, path, marker, snapped) => {
    updateDrawingLink(input);
    expect(input.drawingLink.attr).toBeCalledWith("d", path);
    expect(input.drawingLink.attr).toBeCalledWith(
      "marker-end",
      `url(#${marker})`
    );
    expect(input.drawingLink.classed).toBeCalledWith(
      input.linkSnappedClassName,
      snapped
    );
  });
});
