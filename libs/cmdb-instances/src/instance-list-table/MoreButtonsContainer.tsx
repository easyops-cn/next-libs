import React from "react";
import {
  EllipsisOutlined,
  SettingOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, Button } from "antd";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import styles from "./InstanceListTable.module.css";
import {
  DisplaySettingsModal,
  DisplaySettingsModalData,
} from "./DisplaySettingsModal";

interface MoreButtonsContainerProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  currentFields?: string[];
  defaultFields: string[];
  saveFieldsBackend?: boolean;
  useExternalCmdbApi?: boolean;
  onConfirm: (data: DisplaySettingsModalData) => void;
  onHideSettings?: () => void;
  fieldIds?: string[];
  extraDisabledField?: string;
  handleToggleFixHeader?: () => void;
  fixedHeader?: boolean;
  showFixedHeader?: boolean;
  sortFields?: { field: string; order: number }[];
}

interface MoreButtonsContainerState {
  visible?: boolean;
}

export class MoreButtonsContainer extends React.Component<
  MoreButtonsContainerProps,
  MoreButtonsContainerState
> {
  constructor(props: MoreButtonsContainerProps) {
    super(props);

    this.handleSettingButtonClick = this.handleSettingButtonClick.bind(this);

    this.state = {
      visible: false,
    };
  }
  // istanbul ignore next
  handleSettingButtonClick = (): void => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (data: DisplaySettingsModalData): void => {
    this.setState({
      visible: false,
    });
    this.props?.onConfirm(data);
  };

  handleCancel = (): void => {
    this.setState({
      visible: false,
    });
  };

  render(): React.ReactNode {
    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleSettingButtonClick}>
          <SettingOutlined />
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.DISPLAY_SETTINGS}`)}
        </Menu.Item>
        {this.props.showFixedHeader && (
          <Menu.Item onClick={this.props.handleToggleFixHeader}>
            <PushpinOutlined />
            {this.props.fixedHeader
              ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL_FIX_HEADER}`)
              : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.FIX_HEADER}`)}
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <>
        <Dropdown
          overlay={menu}
          trigger={["click"]}
          className={styles.moreButtonsContainer}
        >
          <Button shape="circle" icon={<EllipsisOutlined />} />
        </Dropdown>
        <DisplaySettingsModal
          visible={this.state.visible}
          currentFields={this.props.fieldIds}
          modelData={this.props.modelData}
          sortFields={this.props.sortFields}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          saveFieldsBackend={this.props.saveFieldsBackend}
          useExternalCmdbApi={this.props.useExternalCmdbApi}
          defaultFields={this.props.defaultFields}
          extraDisabledField={this.props.extraDisabledField}
        />
      </>
    );
  }
}
