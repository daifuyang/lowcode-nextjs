import { request } from '@/utils/request';

export const showPage = async (pageId: number) => {
    return request(`/api/v1/portal/app/app_page/${pageId}`, {
        method: 'get',
      });
}

export const savePage = async (pageId: number, data = {}) => {
  return request(`/api/v1/portal/app/app_page/${pageId}`, {
    method: 'post',
    data
  });
};
