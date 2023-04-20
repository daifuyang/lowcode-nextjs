export const getPageSchema = async (data: any) => {
  const { schema } = data;
  const schemaObj = JSON.parse(schema || "{}");
  const pageSchema = schemaObj?.componentsTree?.[0];
  if (pageSchema) {
    return pageSchema;
  }
  return schema;
};

export class createState {
  state: any;
  constructor(state = {}) {
    this.state = { ...state };
  }
  setState(state: any) {
    this.state = { ...this.state, ...state };
  }
  getState() {
    return this.state;
  }
}

/* 路由跳转规则
 * 默认路由
 * 1.搜索 /search
 * 2.列表 /list/:id/page-:current
 * 3.文章 /article/:id/category-:cid
 * 4.页面 /page/:id
 * 5.标签 /tag/:id
*/

export const getListLink = (category: any) => {
  let link = ''
  if (category.id) {
      link = `/list/${category.id}`
      const { id, alias } = category
      if (alias) {
          link = `/${alias}`
      }
  }
  return link
}

/*
*@Author: frank
*@Date: 2022-07-02 09:52:41
*@Description: 获取跳转路由链接
*/

export const getPostLink = (post: any = {}) => {
  if (post?.more_json?.alias) {
      return post?.more_json?.alias
  }
  let link = 'article'
  if (post?.alias) {
      link = post.alias
  }

  return `/${link}/${post.id}`
}