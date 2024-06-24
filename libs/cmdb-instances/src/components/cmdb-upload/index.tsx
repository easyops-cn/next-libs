import React, { ReactNode, useState } from "react";
import { uniqueId, map, findIndex, some, isEqual } from "lodash";
import { LoadingOutlined } from "@ant-design/icons";
import { Upload, Button } from "antd";
import i18n from "i18next";
import update from "immutability-helper";
import { ButtonType } from "antd/lib/button";
import { FileUtils } from "@next-libs/cmdb-utils";
import { GeneralIcon } from "@next-libs/basic-components";
import { MenuIcon } from "@next-core/brick-types";
import { UploadFile, RcFile } from "antd/lib/upload/interface";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../i18n/constants";
import styles from "./index.module.css";
import { UploadFileUrl, DownloadFileUrl } from "../../constants";

interface UploadFileValueItem {
  name?: string;
  url?: string;
  response?: any;
  file?: any;
  uid?: string;
  size?: number;
  type?: string;
}
interface FileItem {
  url?: string;
  uid?: string;
  response?: any;
  file?: any;
  size?: number;
  type?: string;
  [propName: string]: any;
}
interface UploadButtonProps {
  buttonName: string;
  buttonType: ButtonType;
  buttonIcon: MenuIcon;
}

export interface UploadConfig {
  url?: string;
  method?: any;
  uploadName?: string;
  accept?: string;
  data?: { [key: string]: string };
  maxNumber?: number;
  limitSize?: number;
  hideUploadButton?: boolean;
  uploadButtonName?: string;
}

export interface CmdbUploadProps {
  uploadButtonProps?: UploadButtonProps;
  uploadConfig: UploadConfig;
  onChange?: any;
  onError?: (file: any) => void;
  onRemove?: (file: any) => void;
  disabled?: boolean;
  value?: UploadFileValueItem[];
  style?: React.CSSProperties;
  className?: string;
  autoUpload: boolean;
}

export function addUid(value: UploadFileValueItem[]): FileItem[] {
  let fileList: FileItem[] = [];
  fileList = map(value, (file) => {
    file.uid = file.uid ?? uniqueId("-file");
    return file;
  });
  return fileList;
}

export function compareValues(
  value: UploadFileValueItem[],
  fileList: FileItem[]
): boolean {
  const value1 = map(value, "uid");
  const value2 = map(fileList, "uid");
  const result = isEqual(value1, value2);
  return !result;
}

export function CmdbUpload(props: CmdbUploadProps): React.ReactElement {
  // 默认上传配置
  const defaultUploadConfig: UploadConfig = {
    uploadButtonName: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.UPLOAD}`),
    url: UploadFileUrl,
    maxNumber: 5,
    method: "put",
  };
  const { uploadButtonProps, uploadConfig = defaultUploadConfig } = props;
  const [value, setValue] = React.useState([]);
  const [fileList, setFileList] = useState([]);
  const [disabled, setDisabled] = useState(false);

  React.useEffect(() => {
    setValue(addUid(props.value));
    const isDifferent = compareValues(props.value, fileList);
    if (isDifferent) {
      setFileList(addUid(props.value));
    }
  }, [props.value]);

  const handleValueChange = (v: UploadFileValueItem[]): void => {
    setValue(v);
    props.onChange?.(v);
  };

  const handleBeforeUpload = (file: RcFile): Promise<RcFile> | boolean => {
    if (FileUtils.sizeCompare(file, uploadConfig.limitSize ?? 100)) {
      // 如果上传文件大小大于限定大小
      props.onError?.(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.UPLOAD_SIZE_LARGE_TEXT}`)
      );
      return new Promise((_resolve, reject) => {
        // 返回reject阻止文件添加
        reject(
          new Error(
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.UPLOAD_SIZE_LARGE_TEXT}`)
          )
        );
      });
    }
    if (props.autoUpload) {
      // 进行自动上传
      return new Promise((resolve) => resolve(file));
    } else {
      // 返回false阻止默认上传行为
      return false;
    }
  };

  const handleFilesChange = async (
    newFile: FileItem,
    newFileList: FileItem[],
    isDone: boolean
  ): Promise<void> => {
    if (isDone) {
      if (uploadConfig.maxNumber === 1) {
        setFileList([newFile]);
        handleValueChange([
          {
            response: newFile.response,
            name: newFile.name,
            uid: newFile.uid,
            size: newFile.size,
            type: newFile.type,
            url: `${DownloadFileUrl}/${newFile.response?.objectName}`,
          },
        ]);
      } else {
        setFileList(newFileList);
        handleValueChange([
          ...value,
          {
            response: newFile.response,
            name: newFile.name,
            uid: newFile.uid,
            size: newFile.size,
            type: newFile.type,
            url: `${DownloadFileUrl}/${newFile.response?.objectName}`,
          },
        ]);
      }
    } else {
      if (uploadConfig.maxNumber === 1) {
        setFileList([newFile]);
        if (!props.autoUpload) {
          handleValueChange([
            {
              file: newFile,
              name: newFile.name,
              uid: newFile.uid,
              size: newFile.size,
              type: newFile.type,
            },
          ]);
        }
      } else {
        setFileList(newFileList);
        if (!props.autoUpload) {
          handleValueChange([
            ...value,
            {
              file: newFile,
              name: newFile.name,
              uid: newFile.uid,
              size: newFile.size,
              type: newFile.type,
            },
          ]);
        }
      }
    }
  };
  const handleChange = (data: any) => {
    const _file = data.file;
    if (
      uploadConfig.maxNumber &&
      uploadConfig.maxNumber !== 1 &&
      value?.length >= uploadConfig.maxNumber &&
      _file.status !== "removed" &&
      _file.status !== "error"
    )
      return;
    const _fileList = data.fileList;
    if (some(_fileList, ["status", "uploading"])) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
    if (_file.status === "removed") {
      const index = findIndex(value, ["uid", _file.uid]);
      if (index !== -1) {
        handleValueChange(update(value, { $splice: [[index, 1]] }));
      }
      setFileList(_fileList);
    } else if (_file.status === "error") {
      setDisabled(false);
      const index = findIndex(fileList, ["uid", _file.uid]);
      if (index !== -1) {
        setFileList(update(fileList, { $splice: [[index, 1]] }));
      }
      props.onError?.(_file);
    } else {
      handleFilesChange(_file, _fileList, false);
      // if (_fileList.every((v: any) => v.status === "done" && v.response)) {
      //   _fileList.forEach((file: any) => {
      //     file.response = file.response.data;
      //     handleFilesChange(file, _fileList, true);
      //   });
      // }
      if (_file.response && _file.status === "done") {
        _file.response = _file.response.data;
        handleFilesChange(_file, _fileList, true);
      }
    }
  };

  const uploadNode = () => {
    if (uploadConfig.hideUploadButton) {
      return null;
    }
    return (
      <Button
        disabled={
          (uploadConfig.maxNumber && value?.length >= uploadConfig.maxNumber) ||
          props.disabled
        }
        type={uploadButtonProps?.buttonType}
      >
        <GeneralIcon
          icon={
            uploadButtonProps?.buttonIcon ?? {
              lib: "antd",
              icon: "upload",
              theme: "outlined",
            }
          }
        />
        {uploadButtonProps?.buttonName ??
          uploadConfig.uploadButtonName ??
          "Upload"}
      </Button>
    );
  };

  const handleRemove = (e: any) => {
    props.onRemove?.(e);
  };

  const uploadProps: any = {
    className: props.className,
    method: uploadConfig?.method || "post",
    disabled: props.disabled || disabled,
    data: uploadConfig?.data,
    name: uploadConfig?.uploadName,
    action: uploadConfig?.url || UploadFileUrl,
    accept: uploadConfig?.accept,
    multiple: false,
    listType: "text",
    fileList,
    maxCount: uploadConfig?.maxNumber ?? 5,
    beforeUpload: handleBeforeUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    supportServerRender: true,
    progress: {
      strokeColor: "var(--color-success)",
      trailColor: "var(--color-fill-bg-base-1)",
      strokeWidth: "1px",
      showInfo: false,
    },
    showUploadList: {
      // eslint-disable-next-line react/display-name
      removeIcon: (file: UploadFile): ReactNode =>
        file.status === "error" ? (
          <GeneralIcon
            icon={{
              lib: "antd",
              theme: "outlined",
              icon: "close",
            }}
          />
        ) : (
          <GeneralIcon
            icon={{
              lib: "easyops",
              category: "default",
              icon: "delete",
            }}
          />
        ),
    },
    // eslint-disable-next-line react/display-name
    iconRender: (file: UploadFile): ReactNode =>
      file.status === "uploading" ? (
        <LoadingOutlined />
      ) : (
        <GeneralIcon
          icon={{
            lib: "antd",
            icon: "file-text",
            theme: "outlined",
          }}
        />
      ),
  };
  return (
    <div className={styles.uploadContainer}>
      <Upload {...uploadProps}>{uploadNode()}</Upload>
    </div>
  );
}
