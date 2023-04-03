import type { AppProps } from "next/app";
import { showPage } from "@/services/appPage";
import { createState, getPageSchema } from "@/utils/util";
import { DataSource } from "@zerocmf/lowcode-renderer-core/es/types";
// import { DataHelper, parseData } from "@zerocmf/lowcode-renderer-core/es/utils";
import { create as createDataSourceEngine } from "@alilc/lowcode-datasource-engine/interpret";
import { authInstance, createAxiosFetchHandler, instance } from "@/utils/request";
import "@/styles/globals.css";
import "zero-materials/dist/ZeroUi.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export const requestInit = (context: any) => {
  const protocol = "http://";
  let baseURL = protocol + context?.req?.headers?.host;
  // if (baseURL?.endsWith("/")) {
  //   baseURL = baseURL.slice(0, -1);
  // }
  instance.defaults.baseURL = baseURL;
  authInstance.defaults.baseURL = baseURL;
};

export const getSchema = async (pageId: number) => {
  const res: any = await showPage(pageId);
  if (res?.code != 1) {
    return false;
  }
  const { data } = res;
  const schema = await getPageSchema(data);
  return schema;
};

export const initDataSource = async (schema: any = {}, defaultState = {}) => {
  const context: any = new createState(defaultState);
  const defaultDataSource: DataSource = {
    list: []
  };
  const dataSource = schema.dataSource || defaultDataSource;
  // requestHandlersMap 存在才走数据源引擎方案

  const { dataSourceMap, reloadDataSource } = createDataSourceEngine(dataSource ?? {}, context, {
    requestHandlersMap: {
      fetch: createAxiosFetchHandler()
    }
  });
  await reloadDataSource();
  const state = context.getState();
  const result:any = {}
  Object.keys(state).forEach((key) => {
    const item = state[key];
    if(item.code) {
      console.log('request err',item.response)
    }else {
      result[key] = item
    }
  });
  return result;
};

// const initDataSource = async (schema: any = {}) => {
//   const defaultDataSource: DataSource = {
//     list: []
//   };
//   const dataSource = schema.dataSource || defaultDataSource;
//   // requestHandlersMap 存在才走数据源引擎方案

//   const appHelper = "";
//   const dataHelper = new DataHelper(this, dataSource, appHelper, (config: any) =>
//     parseData(config, this, { thisRequiredInJSE: true })
//   );
//   const res = await dataHelper.getInitData();
//   return res
// };
