import React from "react";
import { mount } from "enzyme";
import { SvgaPlayer } from "./SvgaPlayer";

const mockSetVideo = jest.fn();
const mockClear = jest.fn();

jest.mock("svgaplayerweb", () => {
  return {
    Parser: jest.fn().mockImplementation(() => ({
      load: jest.fn().mockImplementation((src, callback) => callback()),
    })),
    Player: jest.fn().mockImplementation(() => ({
      loop: 0,
      clearsAfterStop: false,
      setVideoItem: mockSetVideo,
      startAnimation: jest.fn(),
      setContentMode: jest.fn(),
      onFinished: jest.fn(),
      clear: mockClear,
    })),
  };
});

describe("GeneralPlayer", () => {
  it("should work", () => {
    const ref = React.createRef<any>();
    const mockOnFinish = jest.fn();
    const props = {
      src: "../image/abc.svga",
      onFinished: mockOnFinish,
    };
    const wrapper = mount(<SvgaPlayer {...props} ref={ref} />);

    expect(mockSetVideo).toBeCalled();
    expect(ref.current.onFinished).toBeCalled();

    wrapper.unmount();
    expect(mockClear).toBeCalled();
  });
});
