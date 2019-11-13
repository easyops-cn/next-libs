import { forEach } from "lodash";

const createInput = (form: HTMLFormElement, key: string, value: any) => {
  const input = document.createElement("input");
  input.setAttribute("type", "hidden");
  input.setAttribute("name", key);
  input.value = value;
  form.appendChild(input);
};

interface SubmitAsFormParams {
  url: string;
  data: any;
  method: "get" | "post";
  target: string;
}

/**
 * @description 用提交表单的方式打开一个链接
 * @param {Object} [options] 选项，默认为 `{method: 'post', target: '_blank'}`
 * @param {string} [options.url] 目标 url
 * @param {object} [options.data] 表单数据
 * @param {string} [options.method] 方法：'get', 'post', etc.
 * @param {string} [options.target] 目标窗口：'_self', '_blank', '_parent', etc.
 */
export const submitAsForm = ({
  url,
  data,
  method = "post",
  target = "_blank"
}: SubmitAsFormParams) => {
  const form = document.createElement("form");
  form.setAttribute("action", url);
  form.setAttribute("method", method);
  form.style.display = "none";
  form.setAttribute("target", target);

  forEach(data, function(value, key) {
    createInput(form, key, value);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
