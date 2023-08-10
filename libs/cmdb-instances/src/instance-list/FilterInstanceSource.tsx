import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { Popover, Input, Button, Radio, Space } from "antd";
import { IconButton } from "./IconButton";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./FilterInstanceSource.module.css";
import { map, isEmpty } from "lodash";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

import { filterObjectIdQuery } from "./InstanceList";

interface FilterInstanceSourceProps {
  visible?: boolean;
  checked?: boolean;
  onIconClicKChange?(checked: boolean): void;
  inheritanceModelIdNameMap?: Record<string, string>;
  value?: string;
  onChange: (value: filterObjectIdQuery) => void;
  onPopoverVisibleChange?(visible: boolean): void;
  jsonLocalStorage?: any;
  isAbstract?: boolean;
}

function encode(keyword: string): string {
  const reg = /[[($^.\]*\\?+{}|)]/gi;
  return keyword.replace(reg, (key) => `\\${key}`);
}

const FilterInstanceSource: FC<FilterInstanceSourceProps> = (props) => {
  const [instanceSource, setInstanceSource] = useState(props.value);
  const [objectIdNameList, setObjectIdNameList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const { checked, visible, jsonLocalStorage, isAbstract } = props;

  const objectNameMap = useMemo(() => {
    return (
      jsonLocalStorage.getItem("instances-sources-objectId-name-map") || {}
    );
  }, [jsonLocalStorage]);

  const _modelIdNameMap = useMemo(() => {
    return isEmpty(props.inheritanceModelIdNameMap)
      ? objectNameMap?.idNameMap
      : props.inheritanceModelIdNameMap;
  }, [props.inheritanceModelIdNameMap, objectNameMap]);

  useEffect(() => {
    const _objectIdNameList = map(_modelIdNameMap, (value, key) => ({
      text: value,
      value: key,
    }));
    setObjectIdNameList(_objectIdNameList);
  }, [_modelIdNameMap, checked]);

  const onReset = (e: any): void => {
    const { parentObjectId, query } = objectNameMap;
    const value: filterObjectIdQuery = {
      objectId: parentObjectId,
      objectName: "",
      query,
      checked: false,
    };
    setKeyword("");
    setInstanceSource("");
    props?.onChange(value);
    props?.onIconClicKChange(false);
    props?.onPopoverVisibleChange(false);
  };

  const onConfirm = (e: any): void => {
    if (!instanceSource) {
      setKeyword("");
      props?.onIconClicKChange(false);
      props?.onPopoverVisibleChange(false);
      return;
    }
    const query: filterObjectIdQuery = {
      objectId: instanceSource,
      objectName: _modelIdNameMap[instanceSource],
      query: objectNameMap?.query || {},
      checked,
    };
    setKeyword("");
    props?.onChange(query);
    props?.onPopoverVisibleChange(false);
  };

  const handleRadioChange = (e: any): void => {
    setInstanceSource(e.target.value);
  };

  const onChange = (e: any): void => {
    const value = encode(e.target.value.trim());
    const _objectIdNameList = map(_modelIdNameMap, (value, key) => ({
      text: value,
      value: key,
    }));
    const regex = new RegExp(value, "ig");
    const filterObjectIdNameList = _objectIdNameList.filter((v) =>
      regex.test(v.text)
    );
    setKeyword(e.target.value.trim());
    setObjectIdNameList(filterObjectIdNameList);
  };

  const onIconCheckedChange = (checked: boolean): void => {
    if (isAbstract) {
      props?.onIconClicKChange(checked);
      props?.onPopoverVisibleChange(checked);
    } else {
      props?.onIconClicKChange(true);
      props?.onPopoverVisibleChange(true);
    }
  };

  const getContent = (): ReactElement => {
    return (
      <>
        <Input
          placeholder={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SEARCH_MODEL}`)}
          suffix={<SearchOutlined />}
          onChange={onChange}
          value={keyword}
          data-testid="instance-source-search"
        />
        <div className={styles.content}>
          {objectIdNameList.length ? (
            <Radio.Group value={instanceSource} onChange={handleRadioChange}>
              <Space direction="vertical">
                {objectIdNameList.map(({ text, value }) => (
                  <Radio key={value} value={value}>
                    {text}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <div className={styles.noData}>
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NO_DATA}`)}
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <Button
            type="text"
            size="small"
            onClick={onReset}
            disabled={isAbstract}
          >
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.RESET}`)}
          </Button>
          <Button type="primary" size="small" onClick={onConfirm}>
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`)}
          </Button>
        </div>
      </>
    );
  };
  return (
    <Popover
      content={getContent()}
      placement="bottomRight"
      overlayStyle={{ width: "325px" }}
      visible={visible}
      trigger="click"
    >
      <IconButton
        checked={checked}
        onChange={onIconCheckedChange}
        style={{ marginRight: 10 }}
        type="filterInstanceSource"
        label={""}
        data-testid="instance-source-icon"
      />
    </Popover>
  );
};

export default FilterInstanceSource;
