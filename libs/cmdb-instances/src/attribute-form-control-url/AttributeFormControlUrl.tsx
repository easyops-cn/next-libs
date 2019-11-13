import { FormControl } from "../model-attribute-form-control/ModelAttributeFormControl";
import { Input } from "antd";
import React, { Component, ReactNode } from "react";
import "./AttributeFormControlUrl.module.css";

export interface AttributeFormControlUrlProps extends Partial<FormControl> {
  value: string;
  onChange: (value: string) => void;
}

export class AttributeFormControlUrl extends Component<
  AttributeFormControlUrlProps
> {
  private url: string;
  private title: string;

  constructor(props: AttributeFormControlUrlProps) {
    super(props);

    const { title, url } = AttributeFormControlUrl.breakDownValue(props.value);
    this.title = title;
    this.url = url;
  }

  static breakDownValue(value: string): { title: string; url: string } {
    const pattern = /^\[(.*)\]\((.*)\)$/;
    const arr = value && value.match(pattern);

    if (arr) {
      return {
        title: arr[1],
        url: AttributeFormControlUrl.getFormattedUrl(arr[2])
      };
    }

    return {
      title: value,
      url: value
    };
  }

  static getFormattedUrl(url: string): string {
    if (url) {
      const pattern = /^(http|https):\/\/.*$/;

      return pattern.test(url) ? url : "http://" + url;
    }
    return "";
  }

  preSetValidation = () => {
    const url = AttributeFormControlUrl.getFormattedUrl(this.url);

    if (this.url !== url) {
      this.url = url;
      this.composeUrl();
    }
  };

  composeUrl(): void {
    const { url, title } = this;
    const value = url || title ? `[${title}](${url})` : "";

    this.props.onChange(value);
  }

  handleUrlChange = (url: string) => {
    this.url = url;
    this.composeUrl();
  };

  handleTitleChange = (title: string) => {
    this.title = title;
    this.composeUrl();
  };

  render(): ReactNode {
    const { readOnly, placeholder } = this.props;
    const { title, url } = this;

    return (
      <div>
        <div className="singleContainer">
          <label className="presetTitle">链接：</label>
          <Input
            readOnly={readOnly}
            value={url}
            type="url"
            onChange={e => this.handleUrlChange(e.target.value)}
            onBlur={this.preSetValidation}
            placeholder={placeholder || "请输入链接"}
          />
        </div>

        <div className="singleContainer">
          <label className="presetTitle">标题：</label>
          <Input
            defaultValue={title}
            type="text"
            onChange={e => this.handleTitleChange(e.target.value)}
            onBlur={this.preSetValidation}
            placeholder="选填，请输入显示的标题"
          />
        </div>
      </div>
    );
  }
}
