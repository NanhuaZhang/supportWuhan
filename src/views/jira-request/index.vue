<template>
  <div class="app-container">
    <el-row :gutter="100" type="flex" justify="space-between">
      <el-col>
        <el-form :inline="true">
          <!--                            <el-form-item label="角色">-->
          <!--                                <el-input disabled v-model="form_user.group"></el-input>-->
          <!--                            </el-form-item>-->
          <el-form-item label="用户">
            <el-select v-model="form_user" value-key="id" filterable placeholder="请选择用户">
              <el-option value="" label="全部" />
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name"
                :value="user"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="版本" size="medium">
            <el-select
              v-model="form_version"
              multiple
              filterable
              collapse-tags
              placeholder="请选择版本"
              style="width: 250px"
            >
              <el-option
                v-for="item in jira_versions"
                :key="item.id"
                :label="item.jira_version"
                :value="item.jira_version"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="success" :loading="loadingShown" @click="jiraShown">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" icon="el-icon-arrow-left" @click="generate_weekly_report">本周</el-button>
              <el-button type="primary" @click="generate_last_weekly_report">上周
                <i class="el-icon-arrow-right el-icon--right" /></el-button>
            </el-button-group>
          </el-form-item>
          <el-form-item label="qa:">
            <el-tag type="danger">{{ qa_efforts }}</el-tag>
          </el-form-item>
          <el-form-item label="dev:">
            <el-tag type="danger">{{ dev_efforts }}</el-tag>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table :data="jira_tables" border :row-class-name="qaDelay">
      <el-table-column
        type="index"
        width="50"
      />
      <el-table-column
        label="name"
        min-width="300px"
      >
        <template slot-scope="scope">
          <span>
            <a
              :href="'https://jira.shopee.io/browse/'+scope.row.key"
              target="_blank"
              class="link-type"
            >{{ scope.row.fields.summary }}</a>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        :filters="status_list"
        prop="fields.status.name"
        column-key="fields.status.name"
        :filter-method="status_filter"
      >
        <template slot-scope="scope">
          <el-button type="text">{{ scope.row.fields.status.name }}</el-button>
        </template>
      </el-table-column>
      <!--                                <el-table-column-->
      <!--                                        label="产品">-->
      <!--                                    <template slot-scope="scope">-->
      <!--                                        <span>-->
      <!--                                         {{ scope.row.fields.customfield_10306 | getName}}-->
      <!--                                        </span>-->
      <!--                                    </template>-->
      <!--                                <el-table-column-->
      <!--                                        label="开发">-->
      <!--                                    <template slot-scope="scope">-->
      <!--                                        <span>-->
      <!--                                         {{ scope.row.fields.customfield_10307 | getName}}-->
      <!--                                        </span>-->
      <!--                                    </template>-->
      <!--                                </el-table-column>-->
      <el-table-column
        v-if="form_user.group!=='QA'"
        prop="fields.customfield_10308.displayName"
        label="测试"
      >
        <template slot-scope="scope">
          <span>
            {{ scope.row.fields.customfield_10308 | getName }}
          </span>
        </template>
      </el-table-column>
      <!--                                <el-table-column-->
      <!--                                        prop="fields.customfield_11200"-->
      <!--                                        label="开始时间">-->
      <!--                                </el-table-column>-->
      <el-table-column
        prop="fields.customfield_10304"
        label="开发时间"
      />
      <el-table-column
        prop="fields.customfield_11002"
        label="开发工时"
      />
      <el-table-column
        prop="fields.customfield_10305"
        label="测试时间"
        sortable
        :sort-method="qa_time_sort"
      />
      <el-table-column
        prop="fields.customfield_11003"
        label="测试工时"
      />
      <!--      <el-table-column-->
      <!--        prop="fields.duedate"-->
      <!--        label="duedate"-->
      <!--      />-->
    </el-table>
  </div>
</template>
<script>
import {
  fetchUserList,
  fetchWeeklyReport,
  fetchLastWeeklyReport, fectchJiraList
} from '@/api/workPlat'
import { getActiveVersions } from '@/api/version'
import saveAs from 'file-saver'

export default {
  name: 'JiraRequest',
  filters: {
    getName: function(value) {
      if (value == null) {
        return null
      }
      return value.displayName.split('@')[0]
    }
  },
  data() {
    return {
      jira_versions: [],
      // 筛选条件
      form_user: '',
      form_version: [],
      // fields: [{"label": "名称", "key": "summary", "disable": 0}, {"label": "状态", "key": "summary", "disable": 0},{"label": "产品", "key": "fields.customfield_10306.displayName"}],
      fields: 'summary,customfield_11200,issuetype,customfield_10307,customfield_10308,customfield_11003,customfield_11002,customfield_10304,customfield_10305,customfield_10306,duedate,issuelinks,subtasks,status',
      //
      jira_tables: [],
      //
      users: [],
      loadingShown: false
    }
  },
  computed: {
    qa_efforts() {
      let effort = 0
      this.jira_tables.forEach(issue => {
        effort += issue.fields.customfield_11003
      })
      return effort.toFixed(2)
    },
    dev_efforts() {
      let effort = 0
      this.jira_tables.forEach(issue => {
        effort += issue.fields.customfield_11002
      })
      return effort.toFixed(2)
    },
    status_list() {
      const status_list = new Set()
      this.jira_tables.forEach(issue => {
        status_list.add(issue.fields.status.name)
      })
      const result = []
      Array.from(status_list).forEach(status => {
        result.push({
          'text': status,
          'value': status
        })
      })
      return result
    }
  },
  created: function() {
    this.get_users()
    this.get_jira_versions()
  },
  methods: {
    get_jira_versions() {
      getActiveVersions().then((response) => {
        console.log(response.data)
        this.jira_versions = response.data
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
      })
    },
    status_filter(value, row, column) {
      console.log(value, row, column)
      // const property = column['property'];
      return row.fields.status.name === value
    },
    // qa delay marked
    qaDelay({ row, rowIndex }) {
      if (row.delay_reason.length > 1) {
        return 'warning-row'
      }
      return ''
    },
    get_users() {
      fetchUserList().then((response) => {
        console.log(response.data)
        // this.getVersion();
        this.users = response.data
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
      })
    },
    qa_time_sort(a, b) {
      a = a.fields.customfield_10305
      b = b.fields.customfield_10305
      if (a == null && b == null) {
        return 0
      }
      if (a == null) {
        return -1
      }
      if (b == null) {
        return 1
      }
      return a >= b ? 1 : -1
    },
    jiraShown() {
      if (this.form_user === '' && this.form_version.length === 0) {
        this.$message({
          showClose: true,
          type: 'warning',
          message: '用户和所选版本不能同时为空'
        })
        return
      }
      this.loadingShown = true
      const postJson = {
        'role': this.form_user.group,
        // "user": this.form_user,
        'user': this.form_user.email,
        'version': this.form_version.join(','),
        'fields': this.fields
      }
      console.log(postJson)
      fectchJiraList(postJson).then((response) => {
        console.log(response.data)
        this.jira_tables = response.data
        this.$message({
          showClose: true,
          message: '获取成功',
          type: 'success'
        })
        this.loadingShown = false
      }).catch(function(error) {
        // handle error
        console.log(error)
        this.loadingShown = false
      }).finally(function() {
        // always executed
        console.log('test')
      })
    },
    generate_weekly_report() {
      if (this.form_user === '') {
        this.$message({
          showClose: true,
          message: '请选择用户生成周报！',
          type: 'warning'
        })
        return
      }
      const postJson = {
        'user_email': this.form_user.email,
        'role': this.form_user.group
      }
      fetchWeeklyReport(postJson).then((response) => {
        console.log(response.data)
        this.$message({
          showClose: true,
          message: '生成成功',
          type: 'success'
        })
        var file = new File([response.data], 'weekly_report.md', { type: 'text/plain;charset=utf-8' })
        saveAs(file)
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
        console.log('test')
      })
    },
    generate_last_weekly_report() {
      if (this.form_user === '') {
        this.$message({
          showClose: true,
          message: '请选择用户生成周报！',
          type: 'warning'
        })
        return
      }
      const postJson = {
        'user_email': this.form_user.email,
        'role': this.form_user.group
      }
      fetchLastWeeklyReport(postJson).then((response) => {
        console.log(response.data)
        this.$message({
          showClose: true,
          message: '生成成功',
          type: 'success'
        })
        var file = new File([response.data], 'last_weekly_report.md', { type: 'text/plain;charset=utf-8' })
        saveAs(file)
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
        console.log('test')
      })
    }
  }
}
</script>

<style scoped>

</style>
