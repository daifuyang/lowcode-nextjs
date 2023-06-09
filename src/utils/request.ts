/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import axios from "axios";
import isBrowser from "./isBrowser";

const codeMessage: any = {
  200: "服务器成功返回请求的数据。",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）。",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器。",
  502: "网关错误。",
  503: "服务不可用，服务器暂时过载或维护。",
  504: "无法连接API服务器，网关超时。"
};

export function createAxiosFetchHandler(siteId: any, config?: Record<string, unknown>) {
  return async function (options: any) {
    const requestConfig: any = {
      ...options,
      url: options.uri,
      method: options.method,
      data: options.params,
      headers: options.headers,
      ...config
    };
    requestConfig.params.siteId = siteId;
    const response = await instance(requestConfig);
    return response;
  };
}

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  if (response && response.status) {
    //console.log('errorHandler', response.status, response.statusText);
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    // console.log('url', url);
    if (isBrowser() && response.status == 401) {
      window.location.href = "/user/login";
      return response;
    }

    if (isBrowser()) {
      // Notification.error({
      //   title: `请求错误 [${status}]`,
      //   content: `${url}\n${errorText}\n${error}`
      // });
    } else {
      console.log(`请求错误 [${status}] - ${url}\n${errorText}\n${error}`);
    }
  } else if (!response) {
    if (isBrowser()) {
      // Notification.error({
      //   title: "您的网络发生异常，无法连接服务器",
      //   content: "网络异常"
      // });
    } else {
      console.log("您的网络发生异常，无法连接服务器", error);
    }
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
export const instance = axios.create({
  responseType: "json", // default
  responseEncoding: "utf8" // default
});

/**
 * 配置oAuth请求时的默认参数
 */
export const authInstance = axios.create({
  responseType: "json", // default
  responseEncoding: "utf8" // default
});

const baseURL = process.env.baseURL;
instance.defaults.baseURL = baseURL;
authInstance.defaults.baseURL = baseURL;

// 添加请求拦截器
authInstance.interceptors.request.use(
  function (config: any) {
    // 在发送请求之前做些什么
    let token: any = localStorage.getItem("token");
    if (token) {
      token = JSON.parse(token);
      config.headers.Authorization = `Bearer ${token.access_token}`;
    } else {
      // Message.error("您的账号已失效，请先登录！");
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

const request = (url: string, config: any) => {
  config.url = url;
  return instance.request(config).catch(function (error) {
    errorHandler(error);
  });
};

const authRequest = (url: string, config: any) => {
  config.url = url;
  // console.log("auth instance", instance.defaults.baseURL);
  // console.log("auth url", url);
  return authInstance.request(config).catch(function (error) {
    errorHandler(error);
  });
};

instance.interceptors.response.use((res) => {
  return res.data;
});

authInstance.interceptors.response.use((res) => {
  return res.data;
});

export { request, authRequest };
