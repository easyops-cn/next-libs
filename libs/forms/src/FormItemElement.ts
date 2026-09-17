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

  /* =========================== Group: basic =========================== */

  /**
   * @property
   * @kind string
   * @required true
   * @default -
   * @description 表单项的 name 值, 即唯一 id
   * @description.en The name value of the form item, i.e. the unique id
   * @group basic
   */
  @property()
  name: string;

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 占位符
   * @description.en Placeholder
   * @group basic
   */
  @property()
  placeholder: string;

  /* =========================== Group: formLabel =========================== */

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 标签文字
   * @description.en Label text
   * @group formLabel
   */
  @property()
  label: string;

  /**
   * @property
   * @kind left | right
   * @required false
   * @default -
   * @description 标签对齐方式
   * @description.en Label alignment
   * @editor radio
   * @editorProps {
   *   "optionType": "button",
   *   "options": [
   *     {
   *       "value": "left",
   *       "icon": {
   *         "lib": "antd",
   *         "icon": "align-left",
   *         "theme": "outlined"
   *       }
   *     },
   *     {
   *       "value": "right",
   *       "icon": {
   *         "lib": "antd",
   *         "icon": "align-right",
   *         "theme": "outlined"
   *       }
   *     }
   *   ]
   * }
   * @group formLabel
   */
  @property()
  labelAlign: string;

  /**
   * @property
   * @kind string
   * @required false
   * @default -
   * @description 标签颜色
   * @description.en Label color
   * @editor color
   * @group formLabel
   */
  @property()
  labelColor: string;

  /**
   * @property
   * @kind boolean
   * @required false
   * @default -
   * @description 标签加粗
   * @description.en Bold label
   * @group formLabel
   */
  @property({ type: Boolean })
  labelBold: boolean;

  /**
   * @property
   * @required false
   * @description 标签 tooltip
   * @description.en Label tooltip
   * @group formLabel
   */
  @property({
    attribute: false,
  })
  labelTooltip: LabelTooltipProps | string | number;

  /**
   * @property
   * @required false
   * @description 标签布局，可设置 span offset 值
   * @description.en Label layout, where the span and offset values can be set
   * @group formLabel
   */
  @property({
    attribute: false,
  })
  labelCol: ColProps;

  /**
   * @property
   * @required false
   * @description 控件布局，可设置 span offset 值
   * @description.en Widget layout, where the span and offset values can be set
   * @group formLabel
   */
  @property({
    attribute: false,
  })
  wrapperCol: ColProps;

  /**
   * @property
   * @required false
   * @description 标签构件, 可以指定额外构件作为标签展示
   * @description.en Label brick; an extra brick can be specified to display as the label
   * @group formLabel
   */
  @property({
    attribute: false,
  })
  labelBrick: LabelBrick;

  /* =========================== Group: formValidation =========================== */

  /**
   * @property
   * @kind boolean
   * @required false
   * @default -
   * @description 表单项是否必填
   * @description.en Whether the form item is required
   * @group formValidation
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
   * @description 数据校验格式(正则表达式)
   * @description.en Data validation format (regular expression)
   * @group formValidation
   */
  @property()
  pattern: string;

  /**
   * @property
   * @kind Record<string, string>
   * @required false
   * @default -
   * @editor message
   * @description 数据校验错误提示
   * @description.en Data validation error message
   * @group formValidation
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
   * @description 自定义校验规则
   * @description.en Custom validation rule
   * @group formValidation
   */
  @property({
    attribute: false,
  })
  validator:
    | Pick<ValidationRule, "validator" | "message">
    | Pick<ValidationRule, "validator" | "message">[];

  /**
   * @property
   * @default true
   * @description 是否自动去除前后的空白字符
   * @description.en Whether to automatically trim the leading and trailing whitespace
   * @group formValidation
   */
  @property({
    attribute: false,
  })
  trim? = true;

  /* =========================== Group: ui =========================== */

  /**
   * @property
   * @required false
   * @default false
   * @description 控制该表单项是否隐藏
   * @description.en Controls whether the form item is hidden
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

  /**
   * @property
   * @required false
   * @description 帮助构件, 通常用于在表单项右侧和下方，展示此表单项的帮助信息
   * @description.en Help brick, usually used to the right of and below the form item to display help information for this form item
   * @group ui
   */
  @property({
    attribute: false,
  })
  helpBrick: HelpBrickProps | string | number;

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
   * @description.en When the parameter is true, the form item is not rendered; otherwise, when it is false, the form item is rendered. When it is not rendered, the value of the form item will not be included in the validate.success event detail.
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
