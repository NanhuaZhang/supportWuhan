import request from '@/utils/request'

const base_url = process.env.VUE_APP_JIRA_BASE_API

export function fetchList(query) {
  return request({
    url: '/rest/donate/transaction',
    baseURL: base_url,
    method: 'get'
  })
}

export function addInfo(query) {
  return request({
    url: '/rest/donate/transaction',
    baseURL: base_url,
    method: 'post',
    data: query
  })
}

export function editInfo(query) {
  return request({
    url: '/rest/donate/transaction',
    baseURL: base_url,
    method: 'put',
    params: { 'id': query.id },
    data: query
  })
}

export function deleteInfo(query) {
  return request({
    url: '/rest/donate/transaction',
    baseURL: base_url,
    method: 'delete',
    params: query
  })
}
