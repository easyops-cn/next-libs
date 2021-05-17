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

  /**
   * @property
   * @kind string
   * @required true
   * @default -
   * @description 表单 name
   */
  @property()
  name: string;

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 表单 label
   */
  @property()
  label: string;

  /**
   * @property
   * @kind boolean
   * @required false
   * @default -
   * @description 表单项是否必填
   */
  @property({
    type: Boolean,
  })
  required: boolean;

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 表单项占位符
   */
  @property()
  placeholder: string;

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 表单项正则
   */
  @property()
  pattern: string;

  /**
   * @property
   * @kind Record<string, string>
   * @required false
   * @default -
   * @description 表单项校验信息文本
   */
  @property({
    attribute: false,
  })
  message: Record<string, string>;

  /**
   * @property
   * @kind ValidationRule
   * @required false
   * @default -
   * @description 表单项自定义校验
   * @group advanced
   */
  @property({
    attribute: false,
  })
  validator:
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];

  /**
   * @property
   * @kind LabelTooltipProps
   * @required false
   * @default -
   * @description 表单项标签 tooltip 配置
   */
  @property({
    attribute: false,
  })
  labelTooltip: LabelTooltipProps | string | number;

  /**
   * @property
   * @kind HelpBrickProps
   * @required false
   * @default -
   * @description 表单项的 helpBrick，通常用于在表单末尾和下面额外展示相关信息
   * @group advanced
   */
  @property({
    attribute: false,
  })
  helpBrick: HelpBrickProps | string | number;

  /**
   * @property
   * @kind HelpBrickProps
   * @required false
   * @default -
   * @description 表单项的 labelBrick, 可以指定额外构件作为 label 的展示
   * @group advanced
   */
  @property({
    attribute: false,
  })
  labelBrick: LabelBrick;

  /**
   * @property
   * @kind ColProps
   * @required false
   * @default -
   * @description 表单项 label 标签布局
   * @group advanced
   */
  @property({
    attribute: false,
  })
  labelCol: ColProps;

  /**
   * @property
   * @kind ColProps
   * @required false
   * @default -
   * @description 表单项控件布局
   * @group advanced
   */
  @property({
    attribute: false,
  })
  wrapperCol: ColProps;

  /**
   * @property
   * @kind boolean
   * @required false
   * @default -
   * @description 控制该表单项是否隐藏
   */
  @property({
    __unstable_doNotDecorate: true,
  })
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
