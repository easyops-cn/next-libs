import React from "react";
import { mount } from "enzyme";
import { InstancesAttachmentDisplay } from "./instances-attachment-display";

describe("InstancesAttachmentDisplay", () => {
  it("should work", () => {
    const images = [
      {
        name: "1888.next-builder.adjust-strategy-image1703834288684716875.png",
        size: 25732,
        type: "image/png",
        url: "api/gateway/logic.cmdb_extend/api/v1/asset/images/download_asset_images?objectName=gns://9031C0CEF9D54C2A8B8ACFAB86E575BF/C6ED477968A34B2E96B996FC744D6F79/48C6306ADCF743638538204777900CB6/601336E083FB482394AF0DD8F097BDC0/A1E4E6CFDFC14491ACF8FFACE41EBDC8&checksum=gns://9031C0CEF9D54C2A8B8ACFAB86E575BF/C6ED477968A34B2E96B996FC744D6F79/48C6306ADCF743638538204777900CB6/601336E083FB482394AF0DD8F097BDC0/A1E4E6CFDFC14491ACF8FFACE41EBDC8",
      },
    ];
    const wrapper = mount(
      <InstancesAttachmentDisplay value={images}></InstancesAttachmentDisplay>
    );

    expect(wrapper.find(".anticon-eye")).toHaveLength(1);
    wrapper.find(".anticon-eye").simulate("click");
    wrapper.find(".anticon-download").simulate("click");
  });
});
