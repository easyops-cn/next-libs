import React from "react";
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Base64 } from "js-base64";
import { FileUtils } from "@next-libs/cmdb-utils";
import { DownloadFileUrl } from "../../../constants";
import styles from "./instances-attachment-display.module.css";

interface InstancesAttachmentDisplayProps {
  value?: Record<string, any>[];
}

function getParams(url: string): Record<string, any> {
  const regex = /[?&]([^=&#]+)(?:=([^&#]*))?/g;
  const params: Record<string, any> = {};
  let match;

  while ((match = regex.exec(url)) !== null) {
    const key = decodeURIComponent(match[1]);
    const value = match[2] ? decodeURIComponent(match[2]) : "";
    params[key] = value;
  }
  return params;
}

function setUrlSearchParams(paramsObject: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(paramsObject)) {
    params.set(key, value);
  }
  return params.toString();
}

export function InstancesAttachmentDisplay(
  props: InstancesAttachmentDisplayProps
): React.ReactElement {
  const { value } = props;
  // 下载
  const handleDownload = (file: any): void => {
    const domain = `${window.location.origin}/next`;
    const link = document.createElement("a");
    link.href = `${domain}/${file.url?.split("?")?.[0]}?${setUrlSearchParams({
      fileName: file.name,
      ...getParams(file.url),
    })}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // 预览
  const handlePreview = (file: any): void => {
    const domain = `${window.location.origin}/next`;
    const params: Record<string, any> = getParams(file.url);
    const checksum =
      params.checksum ||
      file.url?.slice(DownloadFileUrl.length + 1, file.url.length);
    const queryString = setUrlSearchParams({
      checksum,
      fileName: file.name,
      fullfilename: file.name,
      ...params,
    });
    const url = `${domain}/${file.url?.split("?")?.[0]}?${queryString}`;
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
