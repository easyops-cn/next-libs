import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { Clipboard, ClipboardProps } from "./Clipboard";
import { Icon } from "antd";

describe("Clipboard", () => {
  const TEXT = "copy was successful!";

  const props: ClipboardProps = {
    text: TEXT,
    onCopy: jest.fn()
  };

  const spyOnConsoleLog = jest
    .spyOn(console, "log")
    .mockImplementation(() => null);
  const spyOnConsoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => null);

  describe("test default icon", () => {
    let wrapper: ReactWrapper;
    beforeEach(() => {
      wrapper = mount(<Clipboard {...props} />);
    });

    afterEach(() => {
      (props.onCopy as jest.Mock).mockClear();
    });

    it("should work", () => {
      document.execCommand = jest.fn().mockReturnValue(true);
      document.removeEventListener = jest.fn();
      const icon = wrapper.find(Icon);
      expect(icon.length).toBe(1);
      icon.simulate("click");
      expect(document.execCommand).toBeCalledWith("copy");
      expect(props.onCopy).toBeCalledWith(TEXT, true);
      expect(document.removeEventListener).toBeCalledWith(
        "copy",
        expect.any(Function)
      );
    });

    it("should catch error when document.execCommand return false", () => {
      document.execCommand = jest.fn().mockReturnValue(false);

      const icon = wrapper.find(Icon);
      expect(icon.length).toBe(1);
      icon.simulate("click");
      expect(document.execCommand).toBeCalledWith("copy");
      expect(spyOnConsoleLog).toBeCalledWith(
        "unable copy to using execCommand",
        new Error("copy command was unsuccessful!")
      );

      expect(spyOnConsoleError).toBeCalled();
      expect(props.onCopy).toBeCalledWith(TEXT, false);
    });

    it("should work when app running in IE browser", () => {
      document.execCommand = jest.fn().mockReturnValue(false);

      Object.defineProperty(window, "clipboardData", {
        value: {
          setData: jest.fn()
        }
      });
      const icon = wrapper.find(Icon);

      icon.simulate("click");
      expect(document.execCommand).toBeCalledWith("copy");

      expect(props.onCopy).toBeCalledWith(TEXT, true);
    });
  });

  it("should use children instead of default icon ", () => {
    const wrapper = mount(
      <Clipboard {...props}>
        <Icon type="heart" theme="filled" />
      </Clipboard>
    );

    jest.spyOn(document, "execCommand").mockReturnValueOnce(true);

    const icon = wrapper.find(Icon);
    expect(icon.length).toBe(1);
    expect(icon.prop("type")).toBe("heart");
    icon.simulate("click");
    expect(document.execCommand).toBeCalledWith("copy");
    expect(props.onCopy).toBeCalledWith(TEXT, true);
  });
});
