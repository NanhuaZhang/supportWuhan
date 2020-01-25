import request from '@/utils/request'

const base_url = process.env.VUE_APP_JIRA_BASE_API

export function addVersion(query) {
  return request({
    url: '/mitra/add_version',
    method: 'get',
    baseURL: base_url,
    params: query
  })
}

export function deleteVersion(query) {
  return request({
    url: '/mitra/delete_version',
    method: 'get',
    baseURL: base_url,
    params: query
  })
}
// 激活的版本
export function getActiveVersions() {
  return request({
    url: '/mitra/get_versions',
    method: 'get',
    baseURL: base_url
  })
}
