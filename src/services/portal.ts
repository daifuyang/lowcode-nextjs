import { request } from "@/utils/request";

export const fetchCategory = async (id: number) => {
  return request(`/api/v1/portal/app/list/${id}`, {
    method: "get"
  });
};

export const fetchArticle = async (id: number) => {
  return request(`/api/v1/portal/app/post/${id}`, {
    method: "get"
  });
};

export const fetchArticles = async (params: any) => {
  return request(`/api/v1/portal/app/list`, {
    method: "get",
    params
  });
};
