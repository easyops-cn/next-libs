import React from "react";
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Base64 } from "js-base64";
import { FileUtils } from "@next-libs/cmdb-utils";
import styles from "./instances-attachment-display.module.css";

interface InstancesAttachmentDisplayProps {
  value?: Record<string, any>[];
}

export function InstancesAttachmentDisplay(
  props: InstancesAttachmentDisplayProps
): React.ReactElement {
  const { value } = props;
  // 下载
  const handleDownload = (file: any): void => {
    const domain = `${window.location.origin}/next`;
    const link = document.createElement("a");
    link.href = `${domain}/${file.url}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // 预览
  const handlePreview = (file: any): void => {
    const domain = `${window.location.origin}/next`;
    const url = `${domain}/${file.url}`;
    const previewUrl = `${domain}/api/gateway/file_previewer.preview.PreviewFile/onlinePreview?url=${encodeURIComponent(
      Base64.encode(url)
      // window.btoa(url)
    )}`;
    window.open(previewUrl, "_blank");
  };
  return (
    <>
      {value?.map((file: any) => {
        // 是否支持预览
        const isPreview =
          !FileUtils.sizeCompare(file, 100) && FileUtils.supportFileType(file);
        return (
          <div key={file.id} className={styles.attachmentItem}>
            <span>
              <FileTextOutlined style={{ marginRight: "6px" }} />
              <span className={styles.attachmentText}>{file.name}</span>
            </span>
            <span className={styles.attachmentSpan}>
              {isPreview && (
                <EyeOutlined
                  className={styles.attachmentIconItem}
                  onClick={() => handlePreview(file)}
                />
              )}
              <DownloadOutlined
                className={styles.attachmentIconItem}
                onClick={() => handleDownload(file)}
              />
            </span>
          </div>
        );
      })}
    </>
  );
}
