import React from "react";
import { EllipsisOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Modal, Button } from "antd";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { Settings } from "./SettingsContainer";
import styles from "./InstanceListTable.module.css";
interface MoreButtonsContainerProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  currentFields?: string[];
  defaultFields: string[];
  onHandleConfirm: (attrIds: string[]) => void;
  onHideSettings?: () => void;
  onHandleReset: (fields: string[]) => void;
  fieldIds?: string[];
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

  handleSettingButtonClick = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render(): React.ReactNode {
    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleSettingButtonClick}>
          <SettingOutlined />
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SHOW_SETTINGS}`)}
        </Menu.Item>
      </Menu>
    );

    return (
      <div>
        <Dropdown
          overlay={menu}
          trigger={["click"]}
          className={styles.moreButtonsContainer}
        >
          <Button shape="circle" icon={<EllipsisOutlined />} />
        </Dropdown>
        <Modal
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          width={780}
          centered={true}
        >
          <Settings
            currentFields={this.props.fieldIds}
            modelData={this.props.modelData}
            title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SHOW_SETTINGS}`)}
            onHideSettings={this.handleCancel}
            onHandleConfirm={this.props.onHandleConfirm}
            onHandleReset={this.props.onHandleReset}
            defaultFields={this.props.defaultFields}
          />
        </Modal>
      </div>
    );
  }
}
