import React from "react";
import { Dropdown, Menu, Icon, Modal, Button } from "antd";
import { CmdbModels } from "@sdk/cmdb-sdk";
import { Settings } from "./SettingsContainer";
import { InstanceListPresetConfigs } from "./interfaces";

interface MoreButtonsContainerProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  currentFields?: string[];
  defaultFields: string[];
  onHandleConfirm: (attrIds: string[]) => void;
  onHideSettings?: () => void;
  onHandleReset: (fields: string[]) => void;
  onToggleAutoBreakLine?: (autoBreakLine: boolean) => void;
  fieldIds?: string[];
  autoBreakLine: boolean;
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
      visible: false
    };
  }

  handleSettingButtonClick = () => {
    this.setState({
      visible: true
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  render(): React.ReactNode {
    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleSettingButtonClick}>
          <Icon type="setting" /> 显示设置
        </Menu.Item>
      </Menu>
    );

    return (
      <div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button shape="circle" icon="ellipsis" />
        </Dropdown>
        <Modal
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          width={600}
          centered={true}
        >
          <Settings
            currentFields={this.props.fieldIds}
            options={{ autoBreakLine: this.props.autoBreakLine }}
            modelData={this.props.modelData}
            title={"显示设置"}
            onHideSettings={this.handleCancel}
            onHandleConfirm={this.props.onHandleConfirm}
            onHandleReset={this.props.onHandleReset}
            onToggleAutoBreakLine={this.props.onToggleAutoBreakLine}
            defaultFields={this.props.defaultFields}
          />
        </Modal>
      </div>
    );
  }
}
