import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { Clipboard, ClipboardProps } from "./Clipboard";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { HeartFilled } from "@ant-design/icons";
import { message } from "antd";
import i18next from "i18next";
import { K } from "./i18n/constants";

const sypOnMessageSuccess = jest.spyOn(message, "success");
const sypOnMessageError = jest.spyOn(message, "error");

describe("Clipboard", () => {
  const TEXT = "copy was successful!";

  const props: ClipboardProps = {
    text: TEXT,
    onCopy: jest.fn(),
  };

  const spyOnConsoleLog = jest
    .spyOn(console, "log")
    .mockImplementation(() => null);
  const spyOnConsoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => null);

  describe("test default icon", () => {
    let wrapper: ReactWrapper<ClipboardProps>;
    beforeEach(() => {
      wrapper = mount<ClipboardProps>(<Clipboard {...props} />);
    });

    afterEach(() => {
      (props.onCopy as jest.Mock).mockClear();
    });

    it("should work", () => {
      document.execCommand = jest.fn().mockReturnValue(true);
      document.removeEventListener = jest.fn();
      const icon = wrapper.find(LegacyIcon);
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

      const icon = wrapper.find(LegacyIcon);
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

    it("should show default message when without onCopy property", () => {
      document.execCommand = jest.fn().mockReturnValue(true);
      wrapper.setProps({ onCopy: undefined });

      wrapper.find(LegacyIcon).simulate("click");
      expect(sypOnMessageSuccess).toBeCalledWith(i18next.t(K.COPY_SUCCESS));

      (document.execCommand as jest.Mock).mockReturnValue(false);
      wrapper.find(LegacyIcon).simulate("click");
      expect(sypOnMessageError).toBeCalledWith(i18next.t(K.COPY_FAILED));
    });

    it("should work when app running in IE browser", () => {
      document.execCommand = jest.fn().mockReturnValue(false);

      Object.defineProperty(window, "clipboardData", {
        value: {
          setData: jest.fn(),
        },
      });
      const icon = wrapper.find(LegacyIcon);

      icon.simulate("click");
      expect(document.execCommand).toBeCalledWith("copy");

      expect(props.onCopy).toBeCalledWith(TEXT, true);
    });
  });

  it("should use children instead of default icon ", () => {
    const wrapper = mount(
      <Clipboard {...props}>
        <HeartFilled />
      </Clipboard>
    );

    jest.spyOn(document, "execCommand").mockReturnValueOnce(true);

    const icon = wrapper.find(HeartFilled);
    expect(icon).toHaveLength(1);
    icon.simulate("click");
    expect(document.execCommand).toBeCalledWith("copy");
    expect(props.onCopy).toBeCalledWith(TEXT, true);
  });
});
