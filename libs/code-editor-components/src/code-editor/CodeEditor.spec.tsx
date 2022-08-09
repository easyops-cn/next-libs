import React from "react";
import { mount } from "enzyme";
import AceEditor, { IAceOptions } from "react-ace";
import { message } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { Annotation } from "brace";
import fileSaver from "file-saver";
import { FormItemWrapper } from "@next-libs/forms";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import {
  CodeEditorItem,
  CodeEditor,
  CodeEditorItemWrapper,
} from "./CodeEditor";
import { getClickableMarker } from "./getClickableMarker";

jest.mock("./getHighlightMarkers");
jest.mock("./getClickableMarker");

const mockGetClickableMarker = getClickableMarker as jest.Mock;

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

  it("should expand", async () => {
    const wrapper = mount(
      <CodeEditorItem
        theme="tomorrow"
        mode="json"
        value="123"
        minLines={5}
        maxLines={10}
        showExpandButton
      />
    );
    const getEditorOptions = (): IAceOptions =>
      wrapper.find(AceEditor).prop("setOptions");
    const getExpandIconName = (): string =>
      (wrapper.find(".expandIcon").find("AntdIcon").prop("icon") as any).name;

    expect(getExpandIconName()).toBe("expand-alt");
    expect(getEditorOptions()).toMatchObject({
      minLines: 5,
      maxLines: 10,
    });

    wrapper.find(".expandIcon").childAt(0).simulate("click");
    expect(getExpandIconName()).toBe("shrink");
    expect(wrapper.find(AceEditor).prop("setOptions")).toMatchObject({
      minLines: 45,
      maxLines: 45,
    });

    wrapper.find(".expandIcon").childAt(0).simulate("click");
    expect(getExpandIconName()).toBe("expand-alt");
    expect(getEditorOptions()).toMatchObject({
      minLines: 5,
      maxLines: 10,
    });
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

  it("should work with terraform", async () => {
    const wrapper = mount(
      <CodeEditorItem mode="terraform" value="" minLines={5} />
    );
    expect(wrapper.find(AceEditor).prop("mode")).toBe("text");
    const mockSetMode = jest.fn();
    const setAnnotationsMock = jest.fn();
    wrapper.find(AceEditor).invoke("onLoad")({
      getCursorPosition: jest.fn().mockReturnValue({
        row: 1,
        column: 1,
      }),
      getSession: jest.fn().mockReturnValue({
        setAnnotations: setAnnotationsMock,
        getAnnotations: jest.fn().mockReturnValueOnce([]),
        setMode: mockSetMode,
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
    });
    expect(mockSetMode).toHaveBeenCalled();
  });

  it("should work with cel_yaml", async () => {
    const wrapper = mount(
      <CodeEditorItem
        mode="cel_yaml"
        value="any: 'has(req.one)'"
        minLines={5}
      />
    );
    expect(wrapper.find(AceEditor).prop("mode")).toBe("text");
    const mockSetMode = jest.fn();
    const setAnnotationsMock = jest.fn();
    const completers = [{}];
    wrapper.find(AceEditor).invoke("onLoad")({
      getCursorPosition: jest.fn().mockReturnValue({
        row: 1,
        column: 1,
      }),
      getSession: jest.fn().mockReturnValue({
        setAnnotations: setAnnotationsMock,
        getAnnotations: jest.fn().mockReturnValueOnce([]),
        setMode: mockSetMode,
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
    });
    expect(mockSetMode).toHaveBeenCalled();
    expect(completers.length).toBe(1);
  });

  it("should work with cel", async () => {
    const wrapper = mount(
      <CodeEditorItem mode="cel" value="has(req.one)" minLines={5} />
    );
    expect(wrapper.find(AceEditor).prop("mode")).toBe("text");
    const mockSetMode = jest.fn();
    const setAnnotationsMock = jest.fn();
    const completers = [{}];
    wrapper.find(AceEditor).invoke("onLoad")({
      getCursorPosition: jest.fn().mockReturnValue({
        row: 1,
        column: 1,
      }),
      getSession: jest.fn().mockReturnValue({
        setAnnotations: setAnnotationsMock,
        getAnnotations: jest.fn().mockReturnValueOnce([]),
        setMode: mockSetMode,
      }),
      getLastVisibleRow: jest.fn().mockReturnValue(2),
      completers,
    });
    expect(mockSetMode).toHaveBeenCalled();
    expect(completers.length).toBe(1);
  });
});

const formElement = {
  formUtils: {
    validateFields: jest.fn(),
    isFieldTouched: jest.fn().mockReturnValue(true),
  },
};

describe("CodeEditor", () => {
  it("should work", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditor
        theme="tomorrow"
        mode="json"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        required={true}
        showCopyButton={true}
        showExportButton={true}
      />
    );
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
    wrapper.find("Clipboard").invoke("onCopy")("123" as any);
    expect(spyOnMessage).toHaveBeenCalled();
    wrapper.find("Clipboard").invoke("onCopy")("123" as any);
    expect(spyOnMessageError).toHaveBeenCalled();
  });
  it("should work with formElement", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditor
        formElement={formElement as any}
        theme="tomorrow"
        mode="json"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        required={true}
        showCopyButton={true}
        showExportButton={true}
      />
    );
    wrapper.update();
    const callback = jest.fn();
    (
      wrapper.find(FormItemWrapper).prop("validator") as Pick<
        ValidationRule,
        "validator" | "message"
      >[]
    )[0].validator([], "12", callback);
    expect(callback).toHaveBeenCalled();
  });

  it("should work with yaml", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditor
        formElement={formElement as any}
        mode="yaml"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        required={true}
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
    wrapper.update();
    const callback = jest.fn();
    (
      wrapper.find(FormItemWrapper).prop("validator") as Pick<
        ValidationRule,
        "validator" | "message"
      >[]
    )[0].validator([], "12", callback);
    expect(callback).toHaveBeenCalled();

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
      <CodeEditor
        formElement={formElement as any}
        mode="brick_next"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        required={true}
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
    wrapper.find(AceEditor).invoke("onValidate")([{ type: "error" }] as any);
    expect(mockSetMock).toHaveBeenCalled();
  });

  it("should work with brick_next_yaml", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onErrorChange = jest.fn();
    const wrapper = mount(
      <CodeEditor
        formElement={formElement as any}
        mode="brick_next_yaml"
        value="123"
        minLines={5}
        onChange={onChange}
        onBlur={onBlur}
        onErrorChange={onErrorChange}
        required={true}
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
    wrapper.find(CodeEditorItemWrapper).invoke("onValidate")([
      { type: "error" },
    ] as any);
    expect(onErrorChange).toHaveBeenCalled();
  });

  it("should highlight clickable tokens", async () => {
    const onClickHighlightToken = jest.fn();
    const wrapper = mount(
      <CodeEditor
        mode="brick_next_yaml"
        value={`propA: <% CTX.abc %>
propB: <% FN.def %>
`}
        highlightTokens={[
          {
            type: "storyboard-function",
            clickable: true,
          },
        ]}
        onClickHighlightToken={onClickHighlightToken}
      />
    );

    const eventRegistry = new Map<string, Set<any>>();
    const triggerEvent = (eventType: string, e?: any): void => {
      const registry = eventRegistry.get(eventType);
      if (!registry) {
        return;
      }
      for (const fn of registry) {
        fn(e);
      }
    };
    const setCursorStyle = jest.fn();
    const toSingleRange = jest.fn();
    const mockEditor = {
      on: jest.fn((eventType, fn) => {
        let registry = eventRegistry.get(eventType);
        if (!registry) {
          registry = new Set();
          eventRegistry.set(eventType, registry);
        }
        registry.add(fn);
      }),
      off: jest.fn((eventType, fn) => {
        const registry = eventRegistry.get(eventType);
        if (!registry) {
          return;
        }
        registry.delete(fn);
      }),
      getSession: jest.fn(),
      renderer: {
        setCursorStyle,
      },
      session: {
        selection: { toSingleRange },
      },
    };
    wrapper.find(AceEditor).invoke("onLoad")(mockEditor);

    mockGetClickableMarker.mockReturnValueOnce(undefined);
    triggerEvent("mousemove");
    expect(setCursorStyle).toHaveBeenNthCalledWith(1, "");

    mockGetClickableMarker.mockReturnValueOnce({ identifier: "abc" });
    triggerEvent("mousemove");
    expect(setCursorStyle).toHaveBeenNthCalledWith(2, "pointer");

    triggerEvent("mouseout");
    expect(setCursorStyle).toHaveBeenNthCalledWith(3, "");

    mockGetClickableMarker.mockReturnValueOnce(undefined);
    triggerEvent("click");
    expect(onClickHighlightToken).not.toBeCalled();
    expect(toSingleRange).not.toBeCalled();

    mockGetClickableMarker.mockReturnValueOnce({
      highlightType: "storyboard-function",
      identifier: "abc",
    });
    triggerEvent("click");
    expect(toSingleRange).toBeCalled();
    expect(onClickHighlightToken).toBeCalledWith({
      type: "storyboard-function",
      value: "abc",
    });

    wrapper.unmount();
    expect(mockEditor.on).toBeCalledTimes(3);
    expect(mockEditor.off).toBeCalledTimes(3);
  });
});
