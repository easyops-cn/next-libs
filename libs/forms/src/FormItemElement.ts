import ReactDOM from "react-dom";
import { UpdatingElement, property } from "@next-core/brick-kit";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import { ColProps } from "antd/lib/col";

import {
  AbstractGeneralFormElement,
  LabelTooltipProps,
  HelpBrickProps,
  LabelBrick,
} from "./interfaces";

export abstract class FormItemElement extends UpdatingElement {
  readonly isFormItemElement = true;

  @property()
  name: string;

  @property()
  label: string;

  @property({
    type: Boolean,
  })
  required: boolean;

  @property()
  placeholder: string;

  @property()
  pattern: string;

  @property({
    attribute: false,
  })
  message: Record<string, string>;

  @property({
    attribute: false,
  })
  validator:
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];

  @property({
    attribute: false,
  })
  labelTooltip: LabelTooltipProps;

  @property({
    attribute: false,
  })
  helpBrick: HelpBrickProps;

  @property({
    attribute: false,
  })
  labelBrick: LabelBrick;

  @property({
    attribute: false,
  })
  labelCol: ColProps;

  @property({
    attribute: false,
  })
  wrapperCol: ColProps;

  notRender = false;

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
    this._render();
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
