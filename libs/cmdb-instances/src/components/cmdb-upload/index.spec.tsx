import React from "react";
import { act } from "react-dom/test-utils";
import { mount, shallow } from "enzyme";
import { Upload } from "antd";
import { CmdbUpload } from "./index";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../i18n/constants";

jest.mock("@next-core/brick-http");

HTMLCanvasElement.prototype.getContext = jest.fn();
window.URL.createObjectURL = jest.fn();

const fileList: any = [
  {
    uid: "123",
    size: 1234,
    type: "image/png",
    name: "image",
    status: "done",
    url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  },
];

const url = `api/gateway/object_store.object_store.PutObject/api/v1/objectStore/bucket/lytest/object`;

describe("CmdbUpload", () => {
  it("should work", async () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <CmdbUpload
        autoUpload
        uploadConfig={{ method: "put", url: url }}
        value={fileList}
        onChange={onChange}
      />
    );
    await Promise.resolve();
    expect(wrapper.find(".ant-upload-list-item").length).toBe(1);
    wrapper.find(Upload).invoke("onChange")({
      file: {
        uid: "123",
        size: 1234,
        type: "image/png",
        name: "image.png",
        status: "done",
        response: {
          data: {
            objectName: "image.png",
          },
        },
      },
      fileList: [...fileList],
    });
    expect(wrapper.find(".ant-upload-list-item").length).toBe(1);
    wrapper.find(Upload).invoke("onChange")({
      file: {
        uid: "123",
        size: 1234,
        type: "image/png",
        name: "image.png",
        status: "removed",
        response: {
          data: {
            objectName: "image.png",
          },
        },
      },
      fileList: [],
    });
    await jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find(".ant-upload-list-item").length).toBe(0);
    wrapper.find(Upload).invoke("onChange")({
      file: {
        uid: "-img1",
        size: 1024,
        type: "image/png",
        name: "image.png",
        status: "uploading",
        response: {
          data: {
            objectName: "image.png",
          },
        },
      },
      fileList: [
        ...fileList,
        {
          uid: "-img1",
          size: 1024,
          type: "image/png",
          name: "image.png",
          status: "uploading",
          response: {
            data: {
              objectName: "image.png",
            },
          },
        },
      ],
    });
    expect(wrapper.find(Upload).prop("disabled")).toBe(true);

    expect(wrapper.find("Button").text()).toBe("Upload");
    expect(wrapper.find("GeneralIcon").at(0).prop("icon")).toEqual({
      lib: "antd",
      icon: "upload",
      theme: "outlined",
    });
    wrapper.setProps({
      uploadButtonProps: {
        buttonName: "Upload Now",
        buttonIcon: {
          lib: "antd",
          icon: "cloud-upload",
          theme: "outlined",
        },
        buttonType: "link",
      },
    });
    wrapper.update();
    expect(wrapper.find("Button").text()).toBe("Upload Now");
    expect(wrapper.find("Button").prop("type")).toBe("link");
    expect(wrapper.find("GeneralIcon").at(0).prop("icon")).toEqual({
      lib: "antd",
      icon: "cloud-upload",
      theme: "outlined",
    });
  });
});
