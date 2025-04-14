/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { Table } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import classNames from "classnames";
import { getBatchEditableFields } from "@next-libs/cmdb-utils";
import styles from "./SortSettings.module.css";
import { includes } from "lodash";

export interface SortSettingsProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  currentFields: string[];
  sortFields?: { field: string; order: number }[];
  rowKey?: string;
  onSortEnd?: (data: any[]) => void;
}

interface DraggableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  acceptType: string;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const type = "DraggableBodyRow";

const sortField = (dataSource: any[] = [], order: string[]) => {
  return dataSource?.sort((a: any, b: any) => {
    const indexA = order.indexOf(a.id);
    const indexB = order.indexOf(b.id);
    return indexA - indexB;
  });
};

export function SortSettings(props: SortSettingsProps): React.ReactElement {
  const { modelData, currentFields, rowKey, onSortEnd } = props;

  const attrAndRelationList = getBatchEditableFields(modelData);
  const sortAttrList = attrAndRelationList.filter((item: any) =>
    includes(currentFields, item.id)
  );
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);

  const [data, setData] = useState(sortField(sortAttrList, currentFields));
  const columns = [
    {
      title: t(K.ID),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t(K.NAME),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t(K.SORT),
      width: 80,
      render: () => {
        return <UnorderedListOutlined />;
      },
    },
  ];

  const DraggableBodyRow = ({
    index,
    moveRow,
    acceptType,
    className,
    style,
    ...restProps
  }: DraggableBodyRowProps): React.ReactElement => {
    const ref = React.useRef();
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: acceptType || type,
      collect: (monitor) => {
        const { index: dragIndex } = monitor.getItem() || {};
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index
              ? `${styles.dropOverDownward}`
              : `${styles.dropOverUpward}`,
        };
      },
      drop: (item: any) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      item: {
        type: acceptType || type,
        index,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));
    return (
      <tr
        ref={ref}
        className={classNames(className, {
          [dropClassName]: isOver,
        })}
        style={{ cursor: "move", ...style }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = data[dragIndex];
      const newData = update(data, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });
      setData(newData);
      const sortFields = newData.map((item: any) => item.id);
      onSortEnd?.(sortFields);
    },
    [data]
  );

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <Table
        className={styles.customDropTable}
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        components={components}
        onRow={(_, index) =>
          ({
            index,
            moveRow,
          } as React.HTMLAttributes<any>)
        }
        pagination={false}
        scroll={{ y: 400 }}
      />
    </DndProvider>
  );
}
