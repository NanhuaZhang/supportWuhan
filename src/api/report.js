import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/rest/donate/transaction',

    method: 'get'
  })
}

export function addInfo(query) {
  return request({
    url: '/mitra/',
    method: 'get',
    params: query
  })
} export function editInfo(query) {
  return request({
    url: '/mitra/',
    method: 'get',
    params: query
  })
}

export function deleteInfo(query) {
  return request({
    url: '/mitra/',
    method: 'delete',
    params: query
  })
}
