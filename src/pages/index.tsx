import * as components from "zero-materials/es";
import ReactRenderer from "@zerocmf/lowcode-react-renderer";
import { GetServerSidePropsContext } from "next";
import * as NextLink from "next/link";
import { getSchema, initDataSource, requestInit } from "./_app";
import { authInstance, createAxiosFetchHandler, instance } from "@/utils/request";
import { fetchArticle, fetchArticles, fetchCategory } from "@/services/portal";
import { listPage } from "@/services/appPage";
import { getListLink, getArticleLink } from "@/utils/util";
import { useRouter } from "next/router";
import moment from "moment";
import { FC } from "react";

export default function Home(props: any) {
  const router = useRouter();
  const { siteId = "",hasDomain = false } = props
  const Link: FC<any> = (props: any) => {
    Link.displayName = "Link";
    let _href = props.href || "/";
    const searchArr = _href?.split("?");
    let search = "";
    if (searchArr.length > 1) {
      search = searchArr[1];
    }
    const hasSiteId = !hasDomain && siteId
    let href = _href;
    if (hasSiteId) {
      href = _href + "?siteId=" + siteId;
    }
    
    return <components.Link link={NextLink} {...props} href={href} />;
  };

  // 改成支持next-js的Link链接
  const Breadcrumb: FC<any> = (props: any) => {
    Breadcrumb.displayName = "Breadcrumb";
    return <components.Breadcrumb link={Link} {...props} />;
  };

  const ZUiMenu: FC<any> = (props: any) => {
    return <components.ZUiMenu link={Link} {...props} />;
  };

  const Pagination: FC<any> = (props: any) => {
    Pagination.displayName = "Pagination";
    return <components.Pagination link={Link} {...props} />;
  };

  const navigatorTo = (data: any, type: string) => {
    let url;
    if (type == "article") {
      url = getArticleLink(data);
    } else {
      url = getListLink(data);
    }
    if (!hasDomain) {
      url = url + "?siteId=" + siteId;
    }
    router.push(url);
  };

  return (
    <ReactRenderer
      components={{
        ...components,
        Breadcrumb,
        ZUiMenu,
        Pagination,
        Link
      }}
      {...props}
      appHelper={{
        utils: {
          navigatorTo,
          getListLink,
          getArticleLink,
          moment
        },
        requestHandlersMap: {
          fetch: createAxiosFetchHandler(siteId)
        }
      }}
    />
  );
}

const assignSchema = (data: any, schema: any, position: "start" | "end" = "end") => {
  const schemaStr = data.schema;
  let snippet = null;
  let dataSource: any = {};
  try {
    if (schemaStr) {
      const schemaObj = JSON.parse(schemaStr);
      snippet = schemaObj.snippet;
      dataSource = schemaObj.dataSource;
    }
  } catch (error) {}
  if (snippet) {
    if (position != "end") {
      schema?.children?.unshift(snippet);
    } else {
      schema?.children?.push(snippet);
    }
  }

  // 增加必要的数据源
  if (schema.dataSource?.list && dataSource?.list) {
    const { list = [] } = dataSource;
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      const itemExist = schema?.dataSource?.list.find((n: any) => {
        return n.id === item.id;
      });
      if (!itemExist) {
        schema.dataSource?.list?.push(item);
      }
    }
  }
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let props: any = {
    schema: {}
  };
  const state: any = {};
  const { query = {} }: any = context;
  const { pathname, siteId, hasDomain = '' } = query;

  props.siteId = siteId
  props.hasDomain = hasDomain

  instance.interceptors.request.use(function (config: any) {
    if (!config.params) {
      config.params = {};
    }
    config.params.siteId = siteId;
    return config;
  });

  authInstance.interceptors.request.use(function (config: any) {
    if (!config.params) {
      config.params = {};
    }
    config.params.siteId = siteId;
    return config;
  });

  if (pathname === "/") {
    props.schema = await getSchema(1);
  } else if (!!query?.location) {
    let location = JSON.parse(query?.location);
    if (!location) {
      console.error("location not found");
      return {
        notFound: true
      };
    }
    const { type, pattern = {} } = location;
    const { params: { id = 0, current = 1 } = {} } = pattern;

    state.id = id;

    if (type == "list") {
      if (!id) {
        console.error("list id not found");
        return {
          notFound: true
        };
      }
      // 查询当前分类详情

      const res: any = await fetchCategory(id);
      if (res?.code != 1) {
        console.error("fetchArticle response not found",res.msg);
        return {
          notFound: true
        };
      }
      const { data = {} } = res;
      const { list_tpl } = data;

      if (!list_tpl) {
        console.error("list_tpl id not found");
        return {
          notFound: true
        };
      }

      props.schema = await getSchema(list_tpl);

      state.url = getListLink(data);

      // 获取文章列表
      const listRes: any = await fetchArticles({
        ids: id,
        current
      });

      if (listRes.code != 1) {
        console.error("list response not found");
        return {
          notFound: true
        };
      }
      state.data = listRes.data;
    } else if (type == "article") {
      if (!id) {
        console.error("article id not found");
        return {
          notFound: true
        };
      }
      const res: any = await fetchArticle(id);
      if (res?.code != 1) {
        console.error("fetchArticle response not found");
        return {
          notFound: true
        };
      }

      const { data = {} } = res;

      // category 分类
      const categoryId = data?.category?.[0]?.id;
      let one_tpl = "";
      if (categoryId) {
        const cateRes: any = await fetchCategory(categoryId);
        if (cateRes?.code != 1) {
          console.error("fetchCategory response not found");
          return {
            notFound: true
          };
        }
        one_tpl = cateRes.data.one_tpl;
      }
      let { template } = data;
      if (!template) {
        template = one_tpl;
      }

      if (!template) {
        return {
          notFound: true
        };
      }

      const schema = await getSchema(template);
      if (!schema) {
        return {
          notFound: true
        };
      }
      props.schema = schema;
      state.cid = categoryId;
      state.data = data;
    }
  }
  const { schema } = props;

  // 加载公共区块
  const publicRes: any = await listPage({ isPublic: 1, paginate: "no" });
  if (publicRes.code === 1) {
    const { data = [] } = publicRes;
    let header = data?.find((n: any) => n.type === "header");
    if (header) {
      schema.children = schema.children?.filter((n: any) => n.componentName !== "Header");
      assignSchema(header, schema, "start");
    }
    let footer = data?.find((n: any) => n.type === "footer");
    if (footer) {
      schema.children = schema.children?.filter((n: any) => n.componentName !== "Footer");
      assignSchema(footer, schema);
    }
  }

  // 可以执行数据初始化
  const apiState = await initDataSource(schema, state, siteId) || {};

  props.schema = schema;
  
  props.schema.state = { ...state, ...apiState };

  // const { dataSource: { list = [] } = {} } = schema;
  // list.forEach((item: any) => {
  //   item.isInit = false;
  // });

  return {
    props
  };
}
