import ReactDOM from "react-dom";
import { FormItemElement } from "./FormItemElement";

class TestFormItemElement extends FormItemElement {
  renderedTimes = 0;

  protected _render(): void {
    this.renderedTimes++;
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

    expect(element.hidden).toBe(false);
    expect(element.notRender).toBe(false);
    expect(element.renderedTimes).toBe(2);
    element.setNotRender(true);
    expect(element.hidden).toBe(true);
    expect(element.notRender).toBe(true);
    expect(element.renderedTimes).toBe(3);

    element.notRender = false;
    expect(element.hidden).toBe(false);
    expect(element.notRender).toBe(false);
    expect(element.renderedTimes).toBe(4);
  });
});
