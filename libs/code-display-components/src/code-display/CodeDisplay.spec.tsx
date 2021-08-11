import React from "react";
import { mount } from "enzyme";
import { CodeDisplay } from "./CodeDisplay";
import { message } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import fileSaver from "file-saver";

describe("CodeDisplay", () => {
  it("should work", () => {
    const wrapper = mount(
      <CodeDisplay
        language="javascript"
        showLineNumber={true}
        value="const a = 1;"
        showCopyButton={true}
        showExportButton={true}
      />
    );
    expect(wrapper.find(".line-numbers").length).toBe(1);

    wrapper.setProps({
      language: "css",
      showLineNumber: false,
      value: ".a{color:#fff}",
    });
    wrapper.update();
    expect(wrapper.find(".line-numbers").length).toBe(0);

    const spyOnMessage = jest.spyOn(message, "success");
    const spyOnMessageError = jest.spyOn(message, "error");
    (wrapper.find("Clipboard").invoke("onCopy") as any)("123", true);
    expect(spyOnMessage).toHaveBeenCalled();
    (wrapper.find("Clipboard").invoke("onCopy") as any)("123", false);
    expect(spyOnMessageError).toHaveBeenCalled();

    // eslint-disable-next-line
    const spyOnSaveAs = jest.spyOn(fileSaver, "saveAs").mockReturnValue((() => {
      /* do nothing */
    }) as any);
    wrapper.find(ExportOutlined).simulate("click");
    expect(spyOnSaveAs).toHaveBeenCalled();
  });
});
