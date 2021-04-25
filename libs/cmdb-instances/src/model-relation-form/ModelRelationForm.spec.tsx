import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { keyBy } from "lodash";

import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";

import { ModelRelationForm } from "./ModelRelationForm";

import { mockFetchCmdbObjectListReturnValue } from "../__mocks__";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

jest.mock("@next-sdk/cmdb-sdk");

describe("BrickConditionalDisplay", () => {
  const mockPostSearch = (InstanceApi_postSearch as jest.Mock).mockResolvedValue(
    {
      list: [],
      page: 1,
      page_size: 20,
      total: 0,
    }
  );

  it("should work", () => {
    const objectList = mockFetchCmdbObjectListReturnValue;

    const modelMap = keyBy(objectList, "objectId");
    const relation = objectList
      .find((objectData) => objectData.objectId === "CLUSTER")
      .relation_list.find((relation) => relation.left_id === "deviceList");
    const instanceListData: any[] = [];

    const result = render(
      <ModelRelationForm
        modelMap={modelMap}
        relation={relation}
        instanceListData={instanceListData}
      />
    );
    const addText = i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ADD}`);
    const button = result.getByText(addText);
    fireEvent.click(button);
    expect(mockPostSearch).toBeCalled();
  });
});
