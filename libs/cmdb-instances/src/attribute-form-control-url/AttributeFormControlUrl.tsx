import { FormControl } from "../model-attribute-form-control/ModelAttributeFormControl";
import { Input } from "antd";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import React, { Component, ReactNode } from "react";
import "./AttributeFormControlUrl.module.css";

export interface AttributeFormControlUrlProps extends Partial<FormControl> {
  value: string;
  onChange: (value: string) => void;
}

export class AttributeFormControlUrl extends Component<AttributeFormControlUrlProps> {
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
        url: AttributeFormControlUrl.getFormattedUrl(arr[2]),
      };
    }

    return {
      title: value,
      url: value,
    };
  }

  static getFormattedUrl(url: string): string {
    /* istanbul ignore if  */
    if (url) {
      const pattern = /^(http|https):\/\/.*$/;
      // return pattern.test(url) ? url : "http://" + url;
      const urlReg = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*|^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
      const reg = /^\//
      const origin = window.location.origin;
      return pattern.test(url) ? url : urlReg.test(url) ? url : `${origin}${reg.test(url) ? url : '/' + url} `;
    }
    return "";
  }

  // preSetValidation = () => {
  //   const url = AttributeFormControlUrl.getFormattedUrl(this.url);

  //   if (this.url !== url) {
  //     this.url = url;
  //     this.composeUrl();
  //   }
  // };

  /* istanbul ignore next */
  composeUrl(): void {
    const title = this.title ?? "";
    const url = AttributeFormControlUrl.getFormattedUrl(this.url);
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
          <label className="presetTitle">
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.LINK}`)}
          </label>
          <Input
            readOnly={readOnly}
            value={url}
            type="url"
            onChange={(e) => this.handleUrlChange(e.target.value)}
            // onBlur={this.preSetValidation}
            placeholder={
              placeholder ||
              i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.LINK_PLACEHOLDER}`)
            }
          />
        </div>

        <div className="singleContainer">
          <label className="presetTitle">
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.TITLE}`)}
          </label>
          <Input
            defaultValue={title}
            type="text"
            onChange={(e) => this.handleTitleChange(e.target.value)}
            // onBlur={this.preSetValidation}
            placeholder={i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.TITLE_PLACEHOLDER}`
            )}
          />
        </div>
      </div>
    );
  }
}
