<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-table
          :data="versionData"
          tooltip-effect="dark"
          :default-sort="{prop: 'jira_version', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="index"
            width="50"
          />
          <el-table-column
            sortable
            label="版本名称"
            prop="jira_version"
            width="250"
          >
            <template slot-scope="scope">
              <el-tag type="text">{{ scope.row.jira_version }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            width="150"
            prop="create_time"
          />
          <el-table-column align="right">
            <template slot="header" slot-scope="scope">
              <el-row style="margin-top: 10px">
                <el-select v-model="addVersion" filterable clearable placeholder="请选择版本">
                  <el-option
                    v-for="item in jira_versions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-row>
              <div style="margin-bottom: 10px">
                <el-button type="primary" size="medium" plain @click="add_version">添加
                </el-button>
              </div>
            </template>
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
              >Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { fetchJiraVersion } from '@/api/workPlat'
import { addVersion, deleteVersion, getActiveVersions } from '@/api/version'

export default {
  name: 'VersionConfig',
  data() {
    return {
      multipleSelection: [],
      versionData: [],
      addVersion: '',
      jira_versions: []
    }
  },
  created() {
    this.getVersion()
    this.get_jira_versions()
  },
  methods: {
    handleDelete(index, row) {
      console.log(index, row)
      this.$confirm('此操作将永久删除该版本, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        const params = {
          'id': row.id
        }
        deleteVersion(params).then((response) => {
          console.log(response.status)
          let index
          // 这里获取的index，是排序后的数组选中的
          for (let i = 0; i < this.versionData.length; i++) {
            if (this.versionData[i].id === row.id) {
              index = i
            }
          }
          this.versionData.splice(index, 1)
          this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success'
          })
        }).catch(function(error) {
          // handle error
          console.log(error)
        }).finally(function() {
          // always executed

        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    get_jira_versions() {
      fetchJiraVersion().then((response) => {
        this.jira_versions = response.data
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getVersion() {
      getActiveVersions().then((response) => {
        // handle success
        console.log(response.data)
        this.versionData = response.data
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
      })
    },
    add_version() {
      if (this.addVersion === '') {
        this.$message({
          showClose: true,
          type: 'warning',
          message: '添加版本不能为空'
        })
        return
      }
      const params = {
        'name': this.addVersion
      }
      addVersion(params).then((response) => {
        console.log(response.data)
        // this.getVersion();
        if (response.result === true) {
          this.$message({
            showClose: true,
            message: response.msg,
            type: 'success'
          })
          this.getVersion()
          this.addVersion = ''
        } else {
          this.$message({
            showClose: true,
            message: response.msg,
            type: 'warning'
          })
        }
      }).catch(function(error) {
        // handle error
        console.log(error)
      }).finally(function() {
        // always executed
      })
    }
  }
}
</script>

<style scoped>

</style>
