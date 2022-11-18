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
  private _notRender = false;

  /**
   * @kind string
   * @required true
   * @default -
   * @description 表单 name
   * @group basicFormItem
   */
  @property()
  name: string;

  /**
   * @kind string
   * @required false
   * @default -
   * @description 表单 label
   * @group basicFormItem
   */
  @property()
  label: string;

  /**
   * @kind string
   * @required false
   * @default -
   * @description 表单 label颜色
   * @group basicFormItem
   */
  @property()
  labelColor: string;

  /**
   * @kind boolean
   * @required false
   * @default -
   * @description 表单 label加粗
   * @group basicFormItem
   */
  @property({ type: Boolean })
  labelBold: boolean;

  /**
   * @kind boolean
   * @required false
   * @default -
   * @description 表单项是否必填
   * @group basicFormItem
   */
  @property({
    type: Boolean,
  })
  required: boolean;

  /**
   * @kind string
   * @required false
   * @default -
   * @description 表单项占位符
   * @group basicFormItem
   */
  @property()
  placeholder: string;

  /**
   * @kind string
   * @required false
   * @default -
   * @description 表单项正则
   * @group basicFormItem
   */
  @property()
  pattern: string;

  /**
   * @kind Record<string, string>
   * @required false
   * @default -
   * @description 表单项校验信息文本
   * @group basicFormItem
   */
  @property({
    attribute: false,
  })
  message: Record<string, string>;

  /**
   * @kind ValidationRule
   * @required false
   * @default -
   * @description 表单项自定义校验
   * @group advancedFormItem
   */
  @property({
    attribute: false,
  })
  validator:
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];

  /**
   * @required false
   * @description 表单项标签 tooltip 配置
   * @group basicFormItem
   */
  @property({
    attribute: false,
  })
  labelTooltip: LabelTooltipProps | string | number;

  /**
   * @required false
   * @description 表单项的 helpBrick，通常用于在表单末尾和下面额外展示相关信息
   * @group advancedFormItem
   */
  @property({
    attribute: false,
  })
  helpBrick: HelpBrickProps | string | number;

  /**
   * @required false
   * @description 表单项的 labelBrick, 可以指定额外构件作为 label 的展示
   * @group advancedFormItem
   */
  @property({
    attribute: false,
  })
  labelBrick: LabelBrick;

  /**
   * @required false
   * @description 表单项 label 标签布局
   * @group ui
   */
  @property({
    attribute: false,
  })
  labelCol: ColProps;

  /**
   * @required false
   * @description 表单项控件布局
   * @group ui
   */
  @property({
    attribute: false,
  })
  wrapperCol: ColProps;

  /**
   * @default true
   * @description 是否自动去除前后的空白字符
   * @group advancedFormItem
   */
  @property({
    attribute: false,
  })
  trim? = true;

  /**
   * @required false
   * @default false
   * @description 控制该表单项是否隐藏
   * @group ui
   */
  @property({
    __unstable_doNotDecorate: true,
  })
  set notRender(value: boolean) {
    this.hidden = value;
    this._notRender = value;
    this._render();
  }
  get notRender(): boolean {
    return this._notRender;
  }

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

  /**
   * @method
   * @params notRender:boolean
   * @description 参数为 true 时，不渲染该表单子项；反之，为 false 时，则渲染该表单子项。不渲染时，validate.success事件详情将不输出该表单子项的值。
   */
  setNotRender(value: boolean): void {
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
