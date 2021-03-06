import React from "react";
import { mount } from "enzyme";
import AceEditor from "react-ace";
import { ClipboardProps } from "@next-libs/clipboard";
import { message } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { Annotation } from "brace";
import fileSaver from "file-saver";
import { CodeEditorItem } from "./CodeEditor";

describe("CodeEditorItem", () => {
  it("should work", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditorItem
        theme="tomorrow"
        mode="json"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        showCopyButton={true}
        showExportButton={true}
      />
    );
    wrapper.find(AceEditor).invoke("onBlur")(null);
    expect(onBlur).toHaveBeenCalled();
    wrapper.find(AceEditor).invoke("onChange")("456");
    await (global as any).flushPromises();
    expect(onChange).toBeCalledWith("456");
    expect(wrapper.find(".themeTomorrow").length).toBe(1);
    wrapper.setProps({
      theme: "monokai",
    });
    wrapper.update();
    expect(wrapper.find(".themeTomorrow").length).toBe(0);
    wrapper.setProps({
      theme: "github",
    });
    wrapper.update();
    expect(wrapper.find(".themeGithub").length).toBe(1);
    const spyOnMessage = jest.spyOn(message, "success");
    const spyOnMessageError = jest.spyOn(message, "error");
    (wrapper.find("Clipboard").invoke("onCopy") as any)("123", true);
    expect(spyOnMessage).toHaveBeenCalled();
    (wrapper.find("Clipboard").invoke("onCopy") as any)("123", false);
    expect(spyOnMessageError).toHaveBeenCalled();
  });

  it("should work with yaml", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditorItem
        mode="yaml"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        showCopyButton={true}
        showExportButton={true}
      />
    );
    wrapper.find(AceEditor).invoke("onChange")("a: v");
    wrapper.find(AceEditor).invoke("onLoad")({
      getSession: jest.fn().mockReturnValue({
        setAnnotations: jest.fn(),
        getAnnotations: jest.fn().mockReturnValueOnce([]),
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
    });
    wrapper.find(AceEditor).invoke("onChange")("a: b\nccc");
    wrapper.setProps({
      value: "a: b\nccc",
    });
    wrapper.update();
    wrapper.find(AceEditor).invoke("onChange")("a: b\nccc: ddd\n ddd");
    wrapper.setProps({
      value: "a: b\nccc: ddd\n ddd",
    });

    const spyOnSaveAs = jest.spyOn(fileSaver, "saveAs").mockReturnValue((() => {
      /* do nothing */
    }) as any);
    wrapper.find(ExportOutlined).simulate("click");
    expect(spyOnSaveAs).toHaveBeenCalled();
  });

  it("should work with brick_next", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditorItem
        mode="brick_next"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        showCopyButton={true}
        showExportButton={true}
        jsonSchema={{
          type: "object",
          properties: {
            isReal: {
              type: "boolean",
            },
          },
          $schema: "http://json-schema.org/draft-07/schema#",
        }}
      />
    );
    expect(wrapper.find(AceEditor).prop("mode")).toBe("text");
    const mockSetMock = jest.fn();
    wrapper.find(AceEditor).invoke("onLoad")({
      getSession: jest.fn().mockReturnValue({
        setAnnotations: jest.fn(),
        getAnnotations: jest.fn().mockReturnValueOnce([]),
        setMode: mockSetMock,
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
    });
    wrapper.find(AceEditor).invoke("onChange")("isReal: true");
    wrapper.setProps({
      value: "isReal: true",
    });
    wrapper.update();
    wrapper.find(AceEditor).invoke("onValidate")([
      { type: "error" },
    ] as Annotation[]);
    expect(mockSetMock).toHaveBeenCalled();
  });

  it("should work with brick_next_yaml", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditorItem
        mode="brick_next_yaml"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        showCopyButton={true}
        showExportButton={true}
        enableLiveAutocompletion={true}
      />
    );
    expect(wrapper.find(AceEditor).prop("mode")).toBe("text");
    const mockSetMock = jest.fn();
    const setAnnotationsMock = jest.fn();
    wrapper.find(AceEditor).invoke("onLoad")({
      getCursorPosition: jest.fn().mockReturnValue({
        row: 1,
        column: 1,
      }),
      getSession: jest.fn().mockReturnValue({
        setAnnotations: setAnnotationsMock,
        getAnnotations: jest.fn().mockReturnValueOnce([]),
        setMode: mockSetMock,
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
    });
    wrapper.find(AceEditor).invoke("onChange")("id: true");
    wrapper.setProps({
      value: "routes: true",
    });
    wrapper.update();
    expect(setAnnotationsMock).toHaveBeenCalled();
    wrapper.setProps({
      jsonSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
        },
        $schema: "http://json-schema.org/draft-07/schema#",
      },
      value: "id: true",
    });
    expect(setAnnotationsMock).toHaveBeenCalledTimes(2);
    expect(mockSetMock).toHaveBeenCalled();
  });
});
