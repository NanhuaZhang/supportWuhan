import request from '@/utils/request'

const base_url = process.env.VUE_APP_JIRA_BASE_API

export function fetchUserList() {
  return request({
    url: '/workPlat/get_all_user',
    method: 'get',
    baseURL: base_url
  })
}
// jira 的版本
export function fetchJiraVersion() {
  return request({
    url: '/mitra/jira_version',
    method: 'get',
    baseURL: base_url
  })
}

export function fectchJiraList(query) {
  return request({
    url: '/workPlat/jira_shown',
    method: 'post',
    data: query,
    baseURL: base_url
  })
}

export function fetchWeeklyReport(query) {
  return request({
    url: '/mitra/get_weekly_report',
    method: 'post',
    data: query,
    baseURL: base_url
  })
}

export function fetchLastWeeklyReport(query) {
  return request({
    url: '/mitra/get_last_weekly_report',
    method: 'post',
    data: query,
    baseURL: base_url
  })
}
