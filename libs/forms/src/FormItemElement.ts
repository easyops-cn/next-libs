import ReactDOM from "react-dom";
import { UpdatingElement, property } from "@easyops/brick-kit";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import { ColProps } from "antd/lib/col";

import {
  AbstractGeneralFormElement,
  LabelTooltipProps,
  HelpBrickProps,
  LabelBrick,
} from "./interfaces";

export function checkIfIsFormElement(element: HTMLElement): boolean {
  return (
    (element as HTMLElement & { isFormElement?: boolean }).isFormElement ||
    element.nodeName.toLowerCase() === "forms.general-form" // 兼容老版本
  );
}

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
      if (!element || checkIfIsFormElement(element)) {
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

    if (form && form.layout === "inline") {
      this.style.display = "inline-block";
    } else {
      this.style.display = "block";

      if (checkIfIsFormElement(this.parentNode as HTMLElement)) {
        this.style.maxWidth = "1332px";
      }
    }

    this._render();
  }

  disconnectedCallback(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}
