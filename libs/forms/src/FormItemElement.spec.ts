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
  it("should create a custom element", () => {
    const element = document.createElement("form-item") as TestFormItemElement;
    const form = document.createElement("forms.general-form") as any;
    form.isFormElement = true;
    document.body.appendChild(form);

    document.body.appendChild(element);
    expect(element.getFormElement()).toBe(null);
    expect(element.style.display).toBe("block");

    form.layout = "inline";
    form.appendChild(element);
    expect(element.getFormElement()).toBe(form);
    expect(element.style.display).toBe("inline-block");

    form.removeChild(element);
    expect(unmountComponentAtNode).toBeCalled();
  });
});
