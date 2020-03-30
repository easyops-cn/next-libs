import ReactDOM from "react-dom";
import { UpdatingElement, property } from "@easyops/brick-kit";
import { ValidationRule } from "antd/lib/form";

import {
  AbstractGeneralFormElement,
  LabelTooltipProps,
  HelpBrickProps
} from "./interfaces";

export abstract class FormItemElement extends UpdatingElement {
  readonly isFormItemElement = true;

  @property()
  name: string;

  @property()
  label: string;

  @property({
    type: Boolean
  })
  required: boolean;

  @property()
  placeholder: string;

  @property()
  pattern: string;

  @property({
    attribute: false
  })
  message: Record<string, string>;

  @property({
    attribute: false
  })
  validator:
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];

  @property({
    attribute: false
  })
  labelTooltip: LabelTooltipProps;

  @property({
    attribute: false
  })
  helpBrick: HelpBrickProps;

  @property({
    type: Boolean
  })
  notRender: boolean;

  getFormElement(): AbstractGeneralFormElement {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let element: HTMLElement & { isFormElement?: boolean } = this;
    while ((element = element.parentNode as HTMLElement)) {
      if (
        !element ||
        element.isFormElement ||
        // 兼容老版本
        element.nodeName.toLowerCase() === "forms.general-form"
      ) {
        break;
      }
    }
    return element as AbstractGeneralFormElement;
  }

  setNotRender(value: boolean): void {
    this.hidden = value;
    this.notRender = value;
  }

  connectedCallback(): void {
    const form = this.getFormElement();
    this.style.display =
      form && form.layout === "inline" ? "inline-block" : "block";
    this._render();
  }

  disconnectedCallback(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}
