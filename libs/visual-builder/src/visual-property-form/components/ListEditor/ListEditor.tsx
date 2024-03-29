import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GeneralIcon } from "@next-libs/basic-components";
import { Form, Popover } from "antd";
import styles from "./ListEditor.module.css";

const COLUMN_KEY = Symbol.for("column_key");

interface ListEditor {
  name?: string;
  label?: string | React.ReactElement;
  value?: any[];
  required?: boolean;
  listItemKey: string;
  getDefaultItem: (data: any) => Record<string, any>;
  renderFormItem?: (data: any) => React.ReactElement;
  onChange?: (data: any) => void;
}

let key = 0;

export function ListEditor({
  name,
  label,
  value,
  required,
  listItemKey,
  getDefaultItem,
  renderFormItem,
  onChange,
}: ListEditor): React.ReactElement {
  const [list, setList] = useState<any[]>(
    (value ?? []).map((item) => ({
      ...item,
      [COLUMN_KEY]: ++key,
    }))
  );

  useEffect(() => {
    setList(
      (value ?? []).map((item) => ({
        ...item,
        [COLUMN_KEY]: ++key,
      }))
    );
  }, [value]);

  const handleRemoveItem = useCallback(
    (e: React.MouseEvent, item: any): void => {
      e.stopPropagation();
      const key = item[COLUMN_KEY];
      const newList = list.filter((item) => item[COLUMN_KEY] !== key);
      setList(newList);
      onChange(newList);
    },
    [list, onChange]
  );

  const handleAddListItem = (): void => {
    key++;
    const defaultValue = `newItem(${list.length})`;
    const newList = list.concat([
      { ...getDefaultItem(defaultValue), [COLUMN_KEY]: key },
    ]);
    setList(newList);
    onChange?.(newList);
  };

  const renderListForm = useCallback(
    (item: any): React.ReactElement => {
      const handleOnValuesChange = (changeValues: any): void => {
        const key = item[COLUMN_KEY];
        const newList = list.map((item) => {
          if (item[COLUMN_KEY] === key) {
            item = {
              ...item,
              ...changeValues,
            };
          }
          return item;
        });
        setList(newList);
        onChange?.(newList);
      };
      return (
        <Form
          layout="horizontal"
          labelAlign="left"
          labelCol={{
            style: {
              minWidth: "112px",
            },
          }}
          onValuesChange={handleOnValuesChange}
        >
          {renderFormItem(item)}
        </Form>
      );
    },
    [list, onChange, renderFormItem]
  );

  const renderListContent = useMemo((): React.ReactElement => {
    return (
      <div className={styles.listContent}>
        {list.length ? (
          list.map((item, index) => {
            return (
              <Popover
                key={index}
                overlayStyle={{
                  zIndex: 999,
                }}
                content={renderListForm(item)}
                title="Detail"
                trigger="click"
                placement="left"
              >
                <div className={styles.listItem}>
                  <span>{item[listItemKey]}</span>
                  <span onClick={(e) => handleRemoveItem(e, item)}>
                    <GeneralIcon
                      icon={{
                        lib: "easyops",
                        category: "assets-inventory",
                        icon: "out",
                        color: "red",
                      }}
                      style={{
                        padding: "2px",
                        border: "1px solid",
                        borderRadius: "50%",
                      }}
                    />
                  </span>
                </div>
              </Popover>
            );
          })
        ) : (
          <div className={styles.listEmptyItem}>No data</div>
        )}
      </div>
    );
  }, [list, renderListForm, listItemKey, handleRemoveItem]);

  return (
    <div className={styles.listContainer}>
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[{ required: required, message: `请输入${name}` }]}
      >
        <div className={styles.listContent}>{renderListContent}</div>
        <span className={styles.addListItem} onClick={handleAddListItem}>
          <GeneralIcon
            icon={{
              lib: "easyops",
              category: "assets-inventory",
              icon: "xin",
              color: "blue",
            }}
            style={{
              marginRight: "4px",
            }}
          />
          添加
        </span>
      </Form.Item>
    </div>
  );
}
