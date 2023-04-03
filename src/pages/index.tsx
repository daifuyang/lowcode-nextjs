import * as components from "zero-materials/es";
import ReactRenderer from "@zerocmf/lowcode-react-renderer";
import { GetServerSidePropsContext } from "next";
import { getSchema, initDataSource, requestInit } from "./_app";
import { createAxiosFetchHandler } from "@/utils/request";
import { fetchArticle, fetchArticles, fetchCategory } from "@/services/portal";

export default function Home(props: any) {
  return (
    <ReactRenderer
      components={components as any}
      {...props}
      appHelper={{
        requestHandlersMap: {
          fetch: createAxiosFetchHandler()
        }
      }}
    />
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  requestInit(context);
  let props: any = {
    schema: {},
    state: {}
  };

  let { state } = props;

  const { query = {}, req }: any = context;
  if (req.url === "/") {
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
    const { params: { id = 0 } = {} } = pattern;

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
        console.error("fetchArticle response not found");
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

      // 获取文章列表
      const listRes: any = await fetchArticles({
        ids: id
      });

      if (listRes.code != 1) {
        console.error("list response not found");
        return {
          notFound: true
        };
      }
      props.schema = await getSchema(list_tpl);
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
      if(!schema) {
        return {
          notFound: true
        };
      }
      props.schema = schema;
      const { state = {} } = props;
      state.cid = categoryId
      state.data = data;
    }
  }
  const { schema } = props;
  // 可以执行数据初始化
  const apiState = await initDataSource(schema, state);

  props.state = { ...state, ...apiState };

  const { dataSource: { list = [] } = {} } = schema;
  list.forEach((item: any) => {
    item.isInit = false;
  });

  return {
    props
  };
}
