import { handleSegueLink } from "./handleSegueLink";
import { SegueLinkData, SegueLinkError } from "../interfaces";

describe("handleSegueLink", () => {
  it.each<
    [
      input: Parameters<typeof handleSegueLink>[0],
      onSegueLinkCalled: SegueLinkData,
      onSegueLinkErrorCalled: SegueLinkError
    ]
  >([
    [
      {
        sourceVertex: {
          node: {
            originalData: {},
          },
          control: "bottom",
        } as any,
        targetVertex: {
          node: {
            originalData: {},
          },
          control: "top",
        } as any,
        onSegueLink: jest.fn(),
        onSegueLinkError: jest.fn(),
      },
      undefined,
      { message: "The target route has no alias!" },
    ],
    [
      {
        sourceVertex: {
          node: {
            originalData: {
              instanceId: "a",
            },
          },
          control: "bottom",
        } as any,
        targetVertex: {
          node: {
            originalData: {
              alias: "hiking",
            },
          },
          control: "top",
        } as any,
        onSegueLink: jest.fn(),
        onSegueLinkError: jest.fn(),
      },
      {
        source: {
          instanceId: "a",
          segues: undefined,
        },
        target: {
          alias: "hiking",
        },
        segueId: undefined,
        _view: {
          controls: ["bottom", "top"],
        },
      },
      undefined,
    ],
    [
      {
        sourceVertex: {
          node: {
            originalData: {
              instanceId: "a",
              segues: {
                goToHiking: {
                  target: "hiking",
                },
              },
            },
          },
          control: "bottom",
        } as any,
        targetVertex: {
          node: {
            originalData: {
              alias: "hiking",
            },
          },
          control: "top",
        } as any,
        onSegueLink: jest.fn(),
        onSegueLinkError: jest.fn(),
      },
      {
        source: {
          instanceId: "a",
          segues: {
            goToHiking: {
              target: "hiking",
            },
          },
        },
        target: {
          alias: "hiking",
        },
        segueId: "goToHiking",
        _view: {
          controls: ["bottom", "top"],
        },
      },
      undefined,
    ],
    [
      {
        sourceVertex: {
          node: {
            originalData: {},
          },
          control: "bottom",
        } as any,
        targetVertex: {
          x: 1,
          y: 2,
        },
        onSegueLink: jest.fn(),
        onSegueLinkError: jest.fn(),
      },
      undefined,
      undefined,
    ],
  ])("should work", (input, onSegueLinkCalled, onSegueLinkErrorCalled) => {
    handleSegueLink(input);
    if (onSegueLinkCalled === undefined) {
      expect(input.onSegueLink).not.toBeCalled();
    } else {
      expect(input.onSegueLink).toBeCalledWith(onSegueLinkCalled);
    }
    if (onSegueLinkErrorCalled === undefined) {
      expect(input.onSegueLinkError).not.toBeCalled();
    } else {
      expect(input.onSegueLinkError).toBeCalledWith(onSegueLinkErrorCalled);
    }
  });
});
