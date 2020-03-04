import ReactDOM from "react-dom";
import { UpdatingElement, property } from "@easyops/brick-kit";
import {
  AbstractGeneralFormElement,
  LabelTooltipProps,
  HelpBrickProps
} from "./interfaces";

export abstract class FormItemElement extends UpdatingElement {
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
  labelTooltip: LabelTooltipProps;

  @property({
    attribute: false
  })
  helpBrick: HelpBrickProps;

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
