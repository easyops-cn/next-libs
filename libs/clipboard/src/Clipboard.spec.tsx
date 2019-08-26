import React from "react";
import {mount, ReactWrapper} from "enzyme";
import {Clipboard, ClipboardProps} from "./Clipboard";
import {Icon} from "antd";

describe("Clipboard", () => {
  const TEXT = "copy was successful!";
  const mockEvent = {
    stopPropagation: jest.fn(),
    preventDefault: jest.fn(),
    clipboardData: {
      clearData: jest.fn(),
      setData: jest.fn()
    }
  };

  const props: ClipboardProps = {
    text: TEXT,
    onCopy: jest.fn()
  };

  console.log = jest.fn();
  console.error = jest.fn();
  describe("test default icon", () => {
    let wrapper: ReactWrapper;
    beforeEach(() => {
      wrapper = mount(<Clipboard {...props} />);
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
      expect(console.log).toBeCalledWith(
        "unable copy to using execCommand",
        new Error("copy command was unsuccessful!")
      );

      expect(console.error).toBeCalled();
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

    document.execCommand = jest.fn().mockReturnValue(true);
    const icon = wrapper.find(Icon);
    expect(icon.length).toBe(1);
    expect(icon.prop("type")).toBe("heart");
    icon.simulate("click");
    expect(document.execCommand).toBeCalledWith("copy");
    expect(props.onCopy).toBeCalledWith(TEXT, true);
  });
});
