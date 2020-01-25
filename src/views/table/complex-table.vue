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
      <div class="filter-item">
        <span>总捐赠次数:</span>
        <el-tag type="success">{{ total }}</el-tag>
      </div>
      <div class="filter-item">
        <span>目前总金额:</span>
        <el-tag type="warning">{{ total_amount }}</el-tag>
      </div>
      <div class="filter-item">
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="dialogFormVisible = true">
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
        align="center"
        type="index"
        width="80"
      />
      <el-table-column label="捐款时间" align="center" sortable :sort-method="time_sort">
        <template slot-scope="scope">
          <!--          <span>{{ new Date(scope.row.created_time) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="捐款金额" align="center">
        <template slot-scope="{row}">
          <el-tag type="success">{{ row.amount }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="捐款渠道" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="捐款人名" class-name="status-col">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="edit_visiable(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row._id)">
            Delete
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <el-dialog title="添加收款金额" :visible.sync="dialogFormVisible">
      <el-form :model="add_form">
        <el-form-item label="捐款时间：" label-width="120px">
          <el-date-picker
            v-model="add_form.time"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy/MM/dd HH:mm"
            value-format="yyyy/MM/dd HH:mm"
          />
        </el-form-item>
        <el-form-item label="捐款渠道：" label-width="120px">
          <el-input v-model="add_form.channel" />
        </el-form-item>
        <el-form-item label="捐款金额：" label-width="120px">
          <el-input v-model="add_form.amount" />
        </el-form-item>
        <el-form-item label="捐款人名：" label-width="120px">
          <el-input v-model="add_form.name" />
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
          <el-date-picker
            v-model="update_form.time"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy/MM/dd HH:mm"
            value-format="yyyy/MM/dd HH:mm"
          />
        </el-form-item>
        <el-form-item label="捐款渠道：" label-width="120px">
          <el-input v-model="update_form.channel" />
        </el-form-item>
        <el-form-item label="捐款金额：" label-width="120px">
          <el-input v-model="update_form.amount " />
        </el-form-item>
        <el-form-item label="捐款人名：" label-width="120px">
          <el-input v-model="update_form.name" />
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
import { fetchList, addInfo, editInfo, deleteInfo } from '@/api/report'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
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
        'time': '',
        'channel': '',
        'amount': 0,
        'name': ''
      },
      update_form: {
        'id': '',
        'time': '',
        'channel': '',
        'amount': 0,
        'name': ''
      },
      dialogFormVisible: false,
      dialogEditVisible: false,
      tableKey: 0,
      list: [],
      downloadLoading: false,
      listLoading: false,
      // 条数
      total: 0,
      // 金额
      total_amount: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    time_sort(a, b) {
      return a < b
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteInfo({'id': id}).then(response => {
          this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    edit_visiable(row) {
      this.dialogEditVisible = true
      this.update_form = row
      this.update_form.id = row._id
      console.log(this.update_form)
    },
    handleUpdate() {
      editInfo(this.update_form).then(response => {
        this.$message({
          showClose: true,
          message: '编辑成功',
          type: 'success'
        })
        this.getList()
      })
      this.dialogEditVisible = false
    },
    handleAddClick() {
      addInfo(this.add_form).then(response => {
        this.$message({
          showClose: true,
          message: '添加成功',
          type: 'success'
        })
        this.getList()
      })
      this.dialogFormVisible = false
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.results.details
        this.total = response.results.transaction_num
        this.total_amount = response.results.amount.toFixed(2)
        // console.log(response)
        this.listLoading = false
      })
    },

    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['捐赠时间', '金额', '渠道', '名字']
          const filterVal = ['time', 'amount', 'channel', 'name']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '捐赠金额统计表'
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
    }
  }
}
</script>
