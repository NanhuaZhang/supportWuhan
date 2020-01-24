<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <el-input-->
      <!--        v-model="listQuery.title"-->
      <!--        placeholder="Title"-->
      <!--        style="width: 200px;"-->
      <!--        class="filter-item"-->
      <!--        @keyup.enter.native="handleFilter"-->
      <!--      />-->
      <!--      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">-->
      <!--        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item"/>-->
      <!--      </el-select>-->
      <!--      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">-->
      <!--        <el-option-->
      <!--          v-for="item in calendarTypeOptions"-->
      <!--          :key="item.key"-->
      <!--          :label="item.display_name+'('+item.key+')'"-->
      <!--          :value="item.key"-->
      <!--        />-->
      <!--      </el-select>-->
      <!--      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">-->
      <!--        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>-->
      <!--      </el-select>-->

      <span>总捐赠次数</span>
      <el-tag type="success">{{ total }}</el-tag>

      <span>目前总金额</span>
      <el-tag type="warning">{{ total_amount }}</el-tag>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="dialogFormVisible = true">
        Add
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        Export
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="捐款时间" align="center">
        <template slot-scope="scope">
          <!--          <span>{{ new Date(scope.row.created_time) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="捐款金额">
        <template slot-scope="{row}">
          <el-tag>{{ row.report_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="捐款渠道" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.executor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="捐款人名" class-name="status-col">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.report_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="edit_visiable(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row.id)">
            Delete
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <el-dialog title="添加收款金额" :visible.sync="dialogFormVisible">
      <el-form :model="add_form">
        <el-form-item label="捐款时间：" label-width="120px">
          <el-input v-model="add_form.time"></el-input>
        </el-form-item>
        <el-form-item label="捐款渠道：" label-width="120px">
          <el-input v-model="add_form.route"></el-input>
        </el-form-item>
        <el-form-item label="捐款金额：" label-width="120px">
          <el-input v-model="add_form.amount"></el-input>
        </el-form-item>
        <el-form-item label="捐款人名：" label-width="120px">
          <el-input v-model="add_form.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddClick">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑收款金额" :visible.sync="dialogEditVisible">
      <el-form :model="update_form">
        <el-form-item label="捐款时间：" label-width="120px">
          <el-input v-model="update_form.time"></el-input>
        </el-form-item>
        <el-form-item label="捐款渠道：" label-width="120px">
          <el-input v-model="update_form.route"></el-input>
        </el-form-item>
        <el-form-item label="捐款金额：" label-width="120px">
          <el-input v-model="update_form.amount"></el-input>
        </el-form-item>
        <el-form-item label="捐款人名：" label-width="120px">
          <el-input v-model="update_form.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, addInfo, editInfo, deleteInfo} from '@/api/report'
  import waves from '@/directive/waves' // waves directive
  import {parseTime} from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import UploadExcelComponent from '@/components/UploadExcel/index.vue'

  export default {
    name: 'ComplexTable',
    components: {Pagination, UploadExcelComponent},
    directives: {waves},
    filters: {
      environmentFilter(status) {
        const statusMap = {
          test: 'success',
          uat: 'info',
          live: 'danger'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        add_form: {
          "time": "",
          "route": "",
          "amount": "",
          "name": ""
        },
        update_form: {
          "time": "",
          "route": "",
          "amount": "",
          "name": ""
        },
        dialogFormVisible: false,
        dialogEditVisible: false,
        tableKey: 0,
        list: [],
        downloadLoading: false,
        listLoading: false,
        //条数
        total: 0,
        //金额
        total_amount: 0,
        //upload
        tableData: [],
        tableHeader: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      handleDelete(id) {
        deleteInfo(id).then(response => {
          this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success'
          });
          this.getList();
        });
      },
      edit_visiable(row) {
        this.dialogEditVisible = true;
        this.update_form = row;
      },
      handleUpdate(row) {
        editInfo(this.update_form).then(response => {
          this.$message({
            showClose: true,
            message: '编辑成功',
            type: 'success'
          });
          this.getList();
        });
        this.dialogEditVisible = false;
      },
      handleAddClick() {
        addInfo(this.add_form).then(response => {
          this.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          });
          this.getList();
        });
        this.dialogFormVisible = false;
      },
      beforeUpload(file) {
        const isLt1M = file.size / 1024 / 1024 < 1

        if (isLt1M) {
          return true
        }

        this.$message({
          message: 'Please do not upload files larger than 1m in size.',
          type: 'warning'
        })
        return false
      },
      handleSuccess({results, header}) {
        this.tableData = results
        this.tableHeader = header
      },
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          this.listLoading = false;
        })
      },

      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'amount', 'type', 'name']
          const filterVal = ['timestamp', 'amount', 'type', 'name']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
    }
  }
</script>
