// Ref https://github.com/jsdom/jsdom/issues/1030
import "document-register-element";
import ReactDOM from "react-dom";
import { FormItemElement } from "./FormItemElement";

class TestFormItemElement extends FormItemElement {
  protected _render(): void {
    // test only
  }
}
customElements.define("form-item", TestFormItemElement);

const unmountComponentAtNode = jest
  .spyOn(ReactDOM, "unmountComponentAtNode")
  .mockImplementation((() => null) as any);

describe("form-item", () => {
  it("should create a custom element", async () => {
    const element = document.createElement("form-item") as TestFormItemElement;
    const form = document.createElement("forms.general-form");
    form.isFormElement = true;
    document.body.appendChild(form);

    document.body.appendChild(element);
    await jest.runAllTimers();
    expect(element.getFormElement()).toBe(null);

    form.appendChild(element);
    expect(element.getFormElement()).toBe(form);
    expect(element.style.display).toBe("block");

    form.layout = "inline";
    await jest.runAllTimers();
    expect(element.style.display).toBe("inline-block");

    form.removeChild(element);
    await jest.runAllTimers();
    expect(unmountComponentAtNode).toBeCalled();
  });
});
