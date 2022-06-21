import React from "react";
import { mount, shallow } from "enzyme";
import {
  InstanceModelAttributeForm,
  ModelAttributeForm,
} from "./ModelAttributeForm";
import { ModelAttributeFormControl } from "../model-attribute-form-control/ModelAttributeFormControl";
import {
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue,
  mockFetchCmdbObjectListReturnValue,
} from "../__mocks__";
import { Button, Checkbox } from "antd";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
/* eslint-disable  */
jest.mock("../i18n");

describe("ModelAttributeForm", () => {
  const permissionList: any = [
    {
      remark: "露娜测试资源实例编辑",
      resource: {
        name: "instance",
        condition: {
          updateAuthorizers: "%user",
        },
        system: "cmdb",
      },
      roles: ["系统管理员", "IT资源使用人员"],
      system: "CMDB",
      disable: false,
      user: [
        "jeffrey",
        "hellokitty",
        "jamerytest",
        "easyops",
        "hughwang",
        "hedyhu",
        "mannytest",
        "jojiang",
        "jamerytest2",
        "tester0009114",
        "willniu-a",
        "hugheshuang",
        "zukerzhu",
        "raypeng",
      ],
      context: null,
      user_group: [],
      action: "cmdb:LUNA_TEST@EASYOPS_instance_update",
      org: 8888,
      id: "604f3f8b4bbda5001ee3e01c",
    },
    {
      remark: "露娜测试资源实例删除",
      resource: {
        name: "instance",
        condition: {
          deleteAuthorizers: "%user",
        },
        system: "cmdb",
      },
      roles: ["系统管理员", "IT资源使用人员"],
      system: "CMDB",
      disable: false,
      user: [
        "jeffrey",
        "hellokitty",
        "jamerytest",
        "easyops",
        "hughwang",
        "hedyhu",
        "mannytest",
        "jojiang",
        "jamerytest2",
        "tester0009114",
        "willniu-a",
        "hugheshuang",
        "zukerzhu",
        "raypeng",
      ],
      context: null,
      user_group: [],
      action: "cmdb:LUNA_TEST@EASYOPS_instance_delete",
      org: 8888,
      id: "604f3f8b4bbda5001ee3e01d",
    },
    {
      remark: "露娜测试资源实例访问",
      resource: {
        name: "instance",
        condition: {
          readAuthorizers: "%user",
        },
        system: "cmdb",
      },
      roles: [
        "系统管理员",
        "普通用户",
        "IT资源使用人员",
        "manny测试工具",
        "审核用户",
      ],
      system: "CMDB",
      disable: false,
      user: [
        "jiangli",
        "cmdbResourceUser0213364751",
        "auto_test_user1563937593406",
        "lucaslu",
        "58583a76860d8",
        "emily",
        "sfsfsfs224_-sf-",
        "lynetteli",
        "dumbyfeng",
        "cmdbResourceUser5895178642",
        "cmdbResourceUser5447337378",
        "aaronops",
        "kamichen3",
        "wang_qian",
        "cmdbResourceUser20213091054",
        "auto_test_user1555550306302",
        "xxxxxxxx",
        "cmdbResourceUser27019896280",
        "demoUser",
        "auto_test_user1565064104525",
        "fredhu",
        "heyiwuAA",
        "jackyzhu",
        "zzzzzz",
        "wwb_1028",
        "easyops_invalid",
        "audit_manager",
        "auto_test_user1555416562468",
        "auto_test_user1565064110947",
        "5464ddf___",
        "cmdbResourceUser6285500802",
        "abc",
        "auto_test_user1553826602454",
        "cmdbResourceUser24722918817",
        "auto_test_user1555560321852",
        "cmdbResourceUser23356802656",
        "cmdbResourceUser26819749264",
        "markzhou",
        "xiongsitu",
        "astrid",
        "58583a7bfad78",
        "auto_test_user1564997810806",
        "cmdbResourceUser6736850742",
        "chavistan",
        "auto_test_user1555416556523",
        "aaronhe",
        "cmdbResourceUser6285786492",
        "easyops_test5122",
        "aarontest1111q",
        "auto_test_user1555481128062",
        "cmdbResourceUser4594858540",
        "auto_test_user1565064116533",
        "auto_test_user1553912405061",
        "cmdbResourceUser22361017829",
        "charlies",
        "auto_test_user1555382190540",
        "cmdbResourceUser7182478120",
        "easyops_test51222",
        "sfsafsaf-_",
        "cmdbResourceUser5894881992",
        "cmdbResourceUser7025395768",
        "wimihe2222",
        "zukerzhu",
        "annzhang",
        "auto_test_user1555382188689",
        "test190723",
        "anlan",
        "cmdbResourceUser27484564501",
        "jamerytest3",
        "jamerytest2",
        "auto_test_user1553826604601",
        "cmdbResourceUser5588630903",
        "momomo",
        "abcd",
        "auto_test_user1563939810571",
        "test123",
        "paultestxx",
        "jimmyli123",
        "cmdbResourceUser6879352966",
        "cmdbResourceUser2360990107",
        "cmdbResourceUser9759401993",
        "auto_test_user1565074070591",
        "cmdbResourceUser7338395339",
        "zzzz",
        "lionfeng",
        "cmdbResourceUser27185401615",
        "cmdbResourceUser8563751470",
        "jimmyli222",
        "pacinochen",
        "qimengwu",
        "caiwc",
        "auto_test_user1553826600282",
        "lunatest",
        "auto_test_user1553831628500",
        "lunaluo",
        "hahahaha",
        "auto_test_user1563937605657",
        "xiaolinli",
        "tester0009114",
        "auto_test_user1555560319792",
        "cmdbResourceUser7925061572",
        "easyops2_test512222322",
        "sasfsa6_",
        "wimihe123",
        "sirrah",
        "cmdbResourceUser2327527002",
        "auto_test_user1554175119194",
        "cmdbResourceUser8563305825",
        "auto_test_user1563939791972",
        "sasfsa61-",
        "paulxx12",
        "cmdbResourceUser7196787405",
        "cmdbResourceUser4722802440",
        "hedyhu",
        "cmdbResourceUser29237233727",
        "sasfsa6-",
        "assets_manager",
        "paulxx23",
        "wimihe222",
        "wimihe223",
        "cmdbResourceUser7338068994",
        "emilyyin",
        "123456",
        "chasechen",
        "paulxxx",
        "indexzhuo_test",
        "cmdbResourceUser7925394802",
        "auto_test_user1554175124937",
        "cmdbResourceUser0212949264",
        "kamichen5",
        "kamichen4",
        "test0000",
        "kamichen2",
        "Aaron002",
        "auto_test_user1553562687568",
        "anthonyhuang",
        "cmdbResourceUser6824526647",
        "david_test",
        "cyonlu3",
        "fred",
        "linus_user4",
        "linus_user1",
        "linus_user2",
        "linus_user3",
        "cmdbResourceUser24595497932",
        "cmdbResourceUser2879648254",
        "auto_test_user1555481122624",
        "wccai_nima",
        "paulxx1",
        "cmdbResourceUser4333717516",
        "auto_test_user1565074068472",
        "heyiwu",
        "vn513gi",
        "steve20",
        "steve21",
        "steve22",
        "steve23",
        "liuxiang",
        "Monday",
        "shawn",
        "auto_test_user1553598031165",
        "wwweeew",
        "12345679",
        "cmdbResourceUser27196749527",
        "cmdbResourceUser22327245804",
        "yanfa_manager",
        "cmdbResourceUser8492349651",
        "auto_test_user1564997800645",
        "tylerdong",
        "zachary",
        "steve99",
        "cmdbResourceUser5447617212",
        "test_-.sfsaf",
        "cmdbResourceUser4596278723",
        "auto_test_user1563937153924",
        "shixi_daoshi",
        "kevinxu",
        "wccai_hh",
        "jojiang",
        "cmdbResourceUser7185169819",
        "testuser",
        "easyops2_test512222322r12",
        "auto_test_user1565074059749",
        "cmdbResourceUser9758036446",
        "cmdbResourceUser24197153215",
        "xxxxx",
        "echozhou",
        "hangyu",
        "easyops1",
        "12345678",
        "parkpiao",
        "manthatest",
        "auto_test_user1564997807499",
        "wccai_nima5",
        "111tewst.ffsfs",
        "aaron02",
        "aaron03",
        "akitoliu",
        "jimmyli",
        "auto_test_user1555382182127",
        "aaronA",
        "cyonlu",
        "aaron_test01",
        "wimihe1235",
        "wimihe1234",
        "auto_test_user1555560312207",
        "cmdbResourceUser21379342629",
        "test_b",
        "test_a",
        "auto_test_user1553855141965",
        "wccai",
        "view",
        "cmdbResourceUser6143244186",
        "auto_test_user1555550298789",
        "wc_cai11",
        "cmdbResourceUser1379233916",
        "122.122.122.2",
        "cmdbResourceUser6819938945",
        "mathewsma",
        "zhengA",
        "auto_test_user1555416566548",
        "auto_test_user1553598033782",
        "davidcui",
        "pauloo2",
        "cmdbResourceUser0176552599",
        "haha_fsfs",
        "cmdbResourceUser7185697577",
        "cmdbResourceUser6736522330",
        "auto_test_user1564997813114",
        "auto_test_user1553912407470",
        "wimihetest",
        "cmdbResourceUser3356769618",
        "cmdbResourceUser7484830696",
        "safsafas1",
        "heyiwu1",
        "michaelli",
        "paultestoo",
        "cmdbResourceUser5588334666",
        "aaron-no-access",
        "jonah111",
        "cmdbResourceUser9237484208",
        "gawainTest3",
        "fal_test",
        "gawainxie",
        "aadfds",
        "dwliuyongfu",
        "easyops",
        "jacobwen",
        "aarontest",
        "fanpu",
        "hughwang",
        "mars",
        "hunterxue",
        "ann",
        "gawainTest2",
        "auto_test_user1563939806981",
        "cmdbResourceUser0176799099",
        "zongheoffice_manager",
        "44545_-gdgdggd",
        "xxx",
        "test5454_-fsf_--fs",
        "cmdbResourceUser5727634162",
        "kamichen",
        "steve19",
        "steve18",
        "steve15",
        "steve14",
        "steve17",
        "steve13",
        "wc_cai",
        "auto_test_user1553562692998",
        "cmdbResourceUser6442463597",
        "easyops_test512222",
        "zachary4",
        "zachary5",
        "test190723_xx",
        "auto_test_user1563937608476",
        "test_-.haha435353",
        "sfsafsaf-_.",
        "aarontest11q",
        "cmdbResourceUser6824118740",
        "cmdbResourceUser28563539882",
        "auto_test_user1553823582045",
        "janiceshi",
        "auto_test_user1563939801144",
        "cmdbResourceUser22880196701",
        "aaron-crontab",
        "test1234",
        "lambert",
        "abcd1",
        "wwweeeww",
        "abcd2",
        "jeffrey",
        "cmdbResourceUser1379507021",
        "test0111111",
        "cocolan",
        "cmdbuser",
        "cmdbResourceUser26824273471",
        "lxl",
        "auto_test_user1554175128494",
        "jamerytest",
        "frankshi",
        "cmdbResourceUser6442660797",
        "cmdbResourceUser20176659696",
        "cmdbResourceUser4983688896",
        "tadxiang",
        "easyops2_test512222322r1",
        "auto_test_user1563937140207",
        "jooj",
        "auto_test_user1555550304189",
        "xytest01",
        "mannytest",
        "xytest02",
        "nickhu",
        "williamcai",
        "easyops_test5122223",
        "auto_test_user1563937148948",
        "yanfa_leader",
        "aarontest11",
        "johnnyyao",
        "nlicroshan",
        "mantha",
        "safsafas",
        "qwe",
        "cmdbResourceUser7479769267",
        "zach_test",
        "sccba_test5",
        "sccba_test1",
        "sccba_test2",
        "sccba_test3",
        "sccba_test4",
        "brianwu1",
        "sccba_test6",
        "sccba_test7",
        "wccai_nima3",
        "fal_test3",
        "fal_test2",
        "cmdbResourceUser29758631629",
        "cmdbResourceUser6819579428",
        "loganxin",
        "yanfa_group_leader",
        "edgeliang",
        "wimihe",
        "cmdbResourceUser7019241026",
        "cmdbResourceUser9237082597",
        "lynette",
        "hellokitty",
        "anne",
        "hugheshuang",
        "auto_test_user1555550308384",
        "lanlin",
        "zzz",
        "gawainTest",
        "cmdbResourceUser7484394439",
        "xxxxssx",
        "auto_test_instance5244866182",
        "demoTest",
        "cmdbResourceUser6142963474",
        "cmdbResourceUser6879594094",
        "wimihe22",
        "cmdbResourceUser5727362766",
        "garenma",
        "heyiwuA",
        "auto_test_user1555560317681",
        "auto_test_user1563937601755",
        "auto_test_user1553823592210",
        "auto_test_user1555382186857",
        "cmdbResourceUser7481135884",
        "willniu-1",
        "auto_test_user1555481132190",
        "cmdbResourceUser7020718366",
        "AAAAApppp-_",
        "auto_test_user1553912409698",
        "cmdbResourceUser6592669739",
        "test-winsenzhu",
        "auto_test_user1554175130633",
        "ruckerliu",
        "cmdbResourceUser27480293028",
        "cmdbResourceUser7025150278",
        "cmdbResourceUser28492387976",
        "cmdbResourceUser7183029076",
        "alrenhuang",
        "auto_test_user1553598037780",
        "cmdbResourceUser6592976858",
        "lightjiao_test_user",
        "wctestname",
        "qwer",
        "auto_test_user1565074065378",
        "fds",
        "willniu-a",
        "heyiwu2",
        "raypeng",
        "auto_test_user1553823590034",
        "auto_test_user1563937157068",
        "cba",
        "renzi_manager",
        "hhhhh",
        "cmdbResourceUser7196721656",
        "astridli",
        "auto_test_user1555416564523",
        "wc_cai_",
        "wccai_nima33",
        "auto_test_user1553823587675",
        "wimihe223w322223",
        "wwweee",
        "test",
        "easyops_test512",
        "secret_manager",
        "cmdbResourceUser2327014704",
        "mannyzheng",
        "auto_test_user1565064114318",
        "easyops2_test512222322r",
        "yuminghao",
        "stevewang",
        "zekunpan",
        "cmdbResourceUser4197450772",
        "auto_test_user1555481130118",
        "cmdbResourceUser2880971199",
        "11-sfsfsfs",
        "122rgrgrgg-sfsf",
      ],
      context: null,
      user_group: [
        ":5924236efb80c",
        ":592424ac71196",
        ":5b6127844ed84",
        ":592424e73333d",
      ],
      action: "cmdb:LUNA_TEST@EASYOPS_instance_access",
      org: 8888,
      id: "604f3f8b4bbda5001ee3e01b",
    },
  ];
  const props = {
    attributeFormControlInitialValueMap: mockFetchCmdbInstanceDetailReturnValue,
    basicInfoAttrList: mockFetchCmdbObjectDetailReturnValue.attrList,
    objectId: "HOST",
    disabled: false,
    isCreate: true,
    formItemProps: {
      labelCol: { span: 3 },
      wrapperCol: { span: 17 },
    },
    brickList: [
      {
        name: "console-printer",
        label: "使用示例",
        header: "使用示例（根据“参数说明”自动生成）",
        options: {
          theme: "monokai",
          mode: "yaml",
        },
      },
    ],
    objectList: mockFetchCmdbObjectListReturnValue,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  describe("handleSubmit", () => {
    it("should submit", async () => {
      const values: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };

      const newValues: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };
      const newProps = Object.assign({}, props, {
        isCreate: true,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"],
        },
      });
      const spyOnComponentDidMount = jest.spyOn(
        InstanceModelAttributeForm.prototype,
        "componentDidMount"
      );
      const wrapper = mount(
        <InstanceModelAttributeForm
          {...newProps}
          cardRect={{
            getBoundingClientRect: () => {
              return { left: 304, width: 1098, bottom: 12408 };
            },
          }}
        />
      );
      expect(spyOnComponentDidMount).toHaveBeenCalled();
      const instance = wrapper
        .find(ModelAttributeForm)
        .instance() as ModelAttributeForm;

      expect(instance.state.fixedStyle).toStrictEqual({
        position: "fixed",
        left: 304,
        bottom: 0,
        width: 1098,
      });
      const checkBox = wrapper
        .find(ModelAttributeForm)
        .find(Checkbox)
        .find('input[type="checkbox"]');

      checkBox.simulate("change", {
        target: {
          checked: true,
        },
      });
      wrapper.update();

      await (global as any).flushPromises();

      wrapper.update();
      instance.props.form.validateFields = jest
        .fn()
        .mockImplementation(
          (callback: (err: boolean, value: Record<string, any>) => void) => {
            callback(false, values);
          }
        );

      const submitBtn = wrapper
        .find(Button)
        .filter("[data-testid='submit-btn']");

      submitBtn.simulate("click", {
        preventDefault: jest.fn(),
      });
      expect(submitBtn.text()).toBe(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)
      );
      expect(instance.state.sending).toBeTruthy();

      await (global as any).flushPromises();
      expect(props.onSubmit).toBeCalledWith({
        continueCreating: true,
        values: newValues,
      });
      expect(instance.state.sending).toBeFalsy();
    });
    it("should submit and continue", async () => {
      const values: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };

      const newValues: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };
      const newProps = Object.assign({}, props, {
        isCreate: true,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"],
        },
      });
      const spyOnComponentDidMount = jest.spyOn(
        InstanceModelAttributeForm.prototype,
        "componentDidMount"
      );
      const wrapper = mount(
        <InstanceModelAttributeForm
          {...newProps}
          cardRect={{
            getBoundingClientRect: () => {
              return { left: 304, width: 1098, bottom: 12408 };
            },
          }}
        />
      );
      expect(spyOnComponentDidMount).toHaveBeenCalled();
      const instance = wrapper
        .find(ModelAttributeForm)
        .instance() as ModelAttributeForm;

      expect(instance.state.fixedStyle).toStrictEqual({
        position: "fixed",
        left: 304,
        bottom: 0,
        width: 1098,
      });
      const checkBox = wrapper
        .find(ModelAttributeForm)
        .find(Checkbox)
        .find('input[type="checkbox"]');

      checkBox.simulate("change", {
        target: {
          checked: true,
        },
      });
      wrapper.update();

      await (global as any).flushPromises();

      wrapper.update();
      instance.props.form.validateFields = jest
        .fn()
        .mockImplementation(
          (callback: (err: boolean, value: Record<string, any>) => void) => {
            callback(false, values);
          }
        );

      const submitAndContinueBtn = wrapper
        .find(Button)
        .filter("[data-testid='submit-and-continue-btn']");

      submitAndContinueBtn.simulate("click", {
        preventDefault: jest.fn(),
      });
      expect(submitAndContinueBtn.text()).toBe(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE_AND_CONTINUE}`)
      );
      expect(instance.state.sending).toBeTruthy();

      await (global as any).flushPromises();
      expect(props.onSubmit).toBeCalledWith({
        continueCreating: true,
        values: newValues,
        type: "continue",
      });
      expect(instance.state.sending).toBeFalsy();
      expect(wrapper.find("Button").length).toBe(3);
    });
    it("should has hidden submit and continue btn", async () => {
      const newProps = Object.assign({}, props, {
        isCreate: false,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"],
        },
      });
      const wrapper = mount(
        <InstanceModelAttributeForm
          {...newProps}
          cardRect={{
            getBoundingClientRect: () => {
              return { left: 304, width: 1098, bottom: 12408 };
            },
          }}
        />
      );
      await (global as any).flushPromises();

      wrapper.update();

      const submitAndContinueBtn = wrapper
        .find(Button)
        .filter("[data-testid='submit-and-continue-btn']");
      expect(submitAndContinueBtn).toBeVisible;
      expect(wrapper.find("Button").length).toBe(2);
    });
  });

  it("should work", () => {
    const spyOnComponentDidMount = jest.spyOn(
      InstanceModelAttributeForm.prototype,
      "componentDidMount"
    );
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign({}, props, {
          isCreate: false,
          fieldsByTag: [
            {
              name: "基本信息",
              fields: ["_agentHeartBeat", "_agentStatus"],
            },
          ],
          modelData: mockFetchCmdbObjectDetailReturnValue,
        })}
      />
    );
    expect(spyOnComponentDidMount).toHaveBeenCalled();
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    const submitBtn = wrapper.find(Button).filter("[data-testid='submit-btn']");
    expect(submitBtn.text()).toBe(
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)
    );
    expect(instance.state.sending).toBeFalsy();
    wrapper.find("Button").at(1).simulate("click");
    expect(props.onCancel).toHaveBeenCalled();
  });

  it("test blackList", () => {
    const form = {
      getFieldDecorator: () => (comp: React.Component) => comp,
      getFieldsValue: () => {},
      validateFields: jest.fn(),
      resetFields: jest.fn(),
      getFieldsError: jest.fn(() => []),
      setFieldsValue: () => {},
    };
    const wrapper = shallow(
      <ModelAttributeForm
        form={form as any}
        {...Object.assign({}, props, {
          blackList: ["_agentHeartBeat", "_agentStatus"],
          basicInfoAttrList: [
            {
              id: "_agentHeartBeat",
              name: "agent心跳",
              protected: true,
              custom: "true",
              unique: "false",
              readonly: "false",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "int",
                regex: null,
                default_type: "value",
                default: -1,
                struct_define: [],
                mode: "",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
            {
              id: "_agentStatus",
              name: "agent状态",
              protected: true,
              custom: "true",
              unique: "false",
              readonly: "false",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "enum",
                regex: ["未安装", "异常", "正常"],
                default_type: "",
                default: "未安装",
                struct_define: [],
                mode: "",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
            {
              id: "deviceId",
              name: "设备ID",
              protected: true,
              custom: "true",
              unique: "true",
              readonly: "true",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "str",
                regex: null,
                default_type: "function",
                default: "guid()",
                struct_define: [],
                mode: "default",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
          ],
        })}
      />
    );
    expect(
      wrapper.findWhere((n) => n.prop("label") === "agent状态").length
    ).toBe(0);
  });
  it("should work with whiteList", () => {
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign(
          {},
          { ...props, objectId: "APP" },
          {
            isCreate: false,
            fieldsByTag: [
              {
                name: "基本信息",
                fields: ["_agentHeartBeat", "_agentStatus"],
              },
            ],
            modelData: mockFetchCmdbObjectDetailReturnValue,
            permissionList,
            enabledWhiteList: true,
          }
        )}
      />
    );
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    expect(instance.permissionAttrProcess("instance_access")).toBe(
      "readAuthorizers"
    );
    expect(instance.permissionAttrProcess("instance_delete")).toBe(
      "deleteAuthorizers"
    );
    expect(instance.permissionAttrProcess("instance_update")).toBe(
      "updateAuthorizers"
    );
    expect(instance.permissionAttrProcess("instance_operate")).toBe(
      "operateAuthorizers"
    );
    expect(
      instance.permissionAttrProcess("deploy:develop:app_resource_add")
    ).toBe("developAppResourceAdd");
    expect(instance.permissionAttrProcess("test_key")).toBe("test_key");

    expect(
      instance.valuesProcess({
        deleteAuthorizers: null,
      }).deleteAuthorizers
    ).toStrictEqual([]);
    expect(
      instance.valuesProcess({
        deleteAuthorizers: {
          selectedUser: ["test_name"],
          selectedUserGroup: ["test_group"],
        },
      }).deleteAuthorizers
    ).toStrictEqual(["test_name", "test_group"]);
  });

  it("should work with whiteList about HOST", () => {
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign({}, props, {
          isCreate: false,
          fieldsByTag: [
            {
              name: "基本信息",
              fields: ["_agentHeartBeat", "_agentStatus"],
            },
          ],
          modelData: mockFetchCmdbObjectDetailReturnValue,
          permissionList,
          enabledWhiteList: true,
        })}
      />
    );
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    expect(
      instance.valuesProcess({
        operateAuthorizers: null,
      }).operateAuthorizers
    ).toStrictEqual([]);
    expect(
      instance.valuesProcess({
        operateAuthorizers: {
          selectedUser: ["test_name"],
          selectedUserGroup: ["test_group"],
        },
      }).operateAuthorizers
    ).toStrictEqual(["test_name", "test_group"]);
  });

  describe("handleSubmit with whiteList", () => {
    it("should submit", async () => {
      const values: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };

      const newValues: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };
      const newProps = Object.assign({}, props, {
        isCreate: true,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"],
        },
        permissionList,
        enabledWhiteList: true,
      });
      const wrapper = mount(<InstanceModelAttributeForm {...newProps} />);
      const instance = wrapper
        .find(ModelAttributeForm)
        .instance() as ModelAttributeForm;

      const checkBox = wrapper
        .find(ModelAttributeForm)
        .find(Checkbox)
        .find('input[type="checkbox"]');

      checkBox.simulate("change", {
        target: {
          checked: true,
        },
      });
      wrapper.update();

      await (global as any).flushPromises();

      wrapper.update();
      instance.props.form.validateFields = jest
        .fn()
        .mockImplementation(
          (callback: (err: boolean, value: Record<string, any>) => void) => {
            callback(false, values);
          }
        );

      const submitBtn = wrapper
        .find(Button)
        .filter("[data-testid='submit-btn']");

      submitBtn.simulate("click", {
        preventDefault: jest.fn(),
      });
      expect(submitBtn.text()).toBe(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)
      );
      expect(instance.state.sending).toBeTruthy();

      await (global as any).flushPromises();
      expect(props.onSubmit).toBeCalledWith({
        continueCreating: true,
        values: newValues,
      });
      expect(instance.state.sending).toBeFalsy();
    });
  });
  it("should work with json validate", () => {
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign({}, props, {
          isCreate: false,
          fieldsByTag: [
            {
              name: "基本信息",
              fields: ["_agentHeartBeat", "_agentStatus"],
            },
          ],
          modelData: mockFetchCmdbObjectDetailReturnValue,
          permissionList,
          enabledWhiteList: true,
        })}
      />
    );
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    wrapper
      .find(ModelAttributeFormControl)
      .at(0)
      .invoke("jsonValidateCollection")(true);
    expect(instance.state.showError).toEqual({ 基本信息0: true });
  });
});
