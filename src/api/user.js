import request from '@/utils/request'

const base_url = process.env.VUE_APP_JIRA_BASE_API

export function login(data) {
  return request({
    url: '/user/login',
    baseURL: base_url,
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    baseURL: base_url,
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
