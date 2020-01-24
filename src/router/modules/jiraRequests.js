/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const requestRouter = {
  path: '/jira',
  component: Layout,
  redirect: '/jira-request',
  alwaysShow: true,
  name: '需求',
  meta: {
    title: '需求管理',
    icon: 'documentation'
  },
  children: [
    // {
    //   path: 'dynamic-table',
    //   component: () => import('@/views/table/dynamic-table/index'),
    //   name: 'DynamicTable',
    //   meta: { title: 'Dynamic Table' }
    // },
    // {
    //   path: 'drag-table',
    //   component: () => import('@/views/table/drag-table'),
    //   name: 'DragTable',
    //   meta: { title: 'Drag Table' }
    // },
    // {
    //   path: 'inline-edit-table',
    //   component: () => import('@/views/table/inline-edit-table'),
    //   name: 'InlineEditTable',
    //   meta: { title: 'Inline Edit' }
    // },
    {
      path: 'jira-request',
      component: () => import('@/views/jira-request'),
      name: '我的需求',
      meta: { title: '我的需求' }
    }, {
      path: 'versionConfig',
      component: () => import('@/views/jira-request/versionConfig'),
      name: '版本管理',
      meta: { title: '版本管理' }
    }
  ]
}
export default requestRouter
