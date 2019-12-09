<template>
  <div class="data-table">
    <div 
      v-if="tableData && tableData.rows && tableData.rows.length > 0" 
      class="table-container"
    >
      <div class="table-tools flex-c-s" v-if="enableTools">
        <vue-input v-if="enableSearch" class="tools-search" v-model="searchValue" placeholder="Search">
          <i class="iconfont iconsearch" slot="prefix"></i>
        </vue-input>
        <vue-button v-if="enableUpload" class="tools-upload" size="mini" type="text" @click="onUpload">
          <span><i class="iconfont iconupload"></i></span>
        </vue-button>
        <vue-button v-if="enableDownload" class="tools-download" size="mini" type="text" @click="onDownload">
          <span><i class="iconfont icondownload"></i></span>
        </vue-button>
      </div>
      <div 
        class="table-body" 
        :class="{ 'border':tableBorder }"
        :style="{
          minWidth: minWidth + 'px',
          maxWidth: maxWidth + 'px'
        }"
      >
        <div v-for="(tableRow, i) in tableData.rows" :key="i"> 
          <div 
            v-show="tableRow.show || (i === 0 && headerInfirstRow)" 
            class="table-row flex-c"
            :class="{ 'is-header': (i === 0 && headerInfirstRow)}"
            @click="onClickRow(tableRow, i)"
          >
            <div v-if="showCheck" class="table-check flex-c-c" :class="{ 'border':tableBorder }"> 
              <div 
                v-if="i === 0 && headerInfirstRow" 
                class="table-check-all flex-c-c"
                :class="{ 'is-checked': tableRow.checked }"
                @click.stop="onCheckAll(tableRow)"
              >
                <i class="iconfont iconcheck" v-show="tableRow.checked === true"></i> 
                <i class="iconfont iconminus" v-show="tableRow.checked === 'indeterminate'"></i>
              </div>
              <div 
                v-else 
                class="table-check-row flex-c-c"
                :class="{ 'is-checked': tableRow.checked }"
                @click.stop="onCheckRow(tableRow, i)"
              >
                <i class="iconfont iconcheck" v-show="tableRow.checked"></i>
              </div>
            </div>
            <div 
              v-for="(tableCell, j) in tableRow.cells" :key="j" 
              class="table-cell flex-c-s" 
              :class="{ 'border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn ) }"
              :style="getCellStyle(j)"
              @click="onClickCell(tableCell, i, j)"
            >
              <span class="table-cell-content">{{ tableCell.data }}</span>
              <span v-if="i === 0 && headerInfirstRow && sortConfig.includes(j)" class="table-sort  flex-dir-column">
                <i 
                  class="sort-btns sort-ascending" 
                  :class="{ 'activated': activatedSort[j] && activatedSort[j] === 'ascending' }"
                  @click.stop="onSort(j, 'ascending')"
                >
                </i>
                <i 
                  class="sort-btns sort-descending" 
                  :class="{ 'activated': activatedSort[j] && activatedSort[j] === 'descending' }"
                  @click.stop="onSort(j, 'descending')"
                >
                </i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { unemptyArray, is2DMatrix } from '../utils/array.js'
import { unique } from '../utils/unique.js'
import VueButton from './VueButton.vue'
import VueInput from './VueInput.vue'
import '../assets/css/flex.css'
import '../assets/iconfont/iconfont.css'

export default {
  name: 'VueTableDynamic',
  data () {
    return {
      tableData: {},
      searchValue: '',
      activatedSort: {}
    }
  },
  props: {
    // 表格相关信息
    // params.data: （二维矩阵）表格数据
    // params.border: (Boolean) 是否带边框。默认不带
    // params.header: (String) 表头类型。 'row': 第一行作为表头； 'column': 第一列作为表头； ''/'none'/other: 无表头。 默认无
    // params.showCheck: (Boolean) 是否在第一列前显示多选（勾选）框。 默认不显示。  注：仅当params.header为'row时，第一行第一列为'全选'框，否则第一列均为当前行的勾选框
    // params.enableUpload: (Boolean) 启用上传功能。默认禁用
    // params.onUpload: (Function) 点击上传时的回调
    // params.enableDownload: (Boolean) 启用下载功能。默认禁用
    // params.onDownload: (Function) 点击下载时的回调
    // params.enableSearch: (Boolean) 启用搜索功能。默认禁用
    // params.minWidth: (Number) table最小宽度。默认300
    // params.maxWidth: (Number) table最大宽度。默认1000
    // params.columnWidth: (Array) 指定某一列或某几列的宽度，剩余列宽度均分. [{column: 0, width: 80}, {column: 1, width: '20%'}]
    // params.sort: (Array) 指定以某列为基准排序。如指定第1列和第二列可排序：[0, 1]。 只在配置了第一行作为表头时有效
    params: { type: Object, default: () => { return {} } }
  },
  computed: {
    sourceData () {
      if (this.params && Array.isArray(this.params.data)) {
        return this.params.data
      }
      return []
    },
    tableBorder () {
      return !!(this.params && this.params.border)
    },
    headerInfirstRow () {
      return !!(this.params && this.params.header === 'row')
    },
    headerInfirstColumn () {
      return !!(this.params && this.params.header === 'column')
    },
    showCheck () {
      return !!(this.params && this.params.showCheck)
    },
    enableUpload () {
      return !!(this.params && this.params.enableUpload)
    },
    uploadHandler () {
      if (this.params && typeof this.params.onUpload === 'function') {
        return this.params.onUpload
      }
      return () => {}
    },
    enableDownload () {
      return !!(this.params && this.params.enableDownload)
    },
    downloadHandler () {
      if (this.params && typeof this.params.onDownload === 'function') {
        return this.params.onDownload
      }
      return () => {}
    },
    enableSearch () {
      return !!(this.params && this.params.enableSearch)
    },
    enableTools () {
      return this.enableUpload || this.enableDownload || this.enableSearch
    },
    minWidth () {
      if (this.params && typeof this.params.minWidth === 'number' && this.params.minWidth > 0) {
        return this.params.minWidth
      }
      return 300
    },
    maxWidth () {
      if (this.params && typeof this.params.maxWidth === 'number' && this.params.maxWidth > 0) {
        return this.params.maxWidth
      }
      return 1000
    },
    columnWidth () {
      if (this.params && unemptyArray(this.params.columnWidth)) {
        let obj = {}
        this.params.columnWidth.forEach(c => {
          if (c && typeof c.column === 'number' && c.column >= 0) {
            if (typeof c.width === 'number' && c.width >= 0) {
              obj[c.column] = c.width + 'px'
            } else if (typeof c.width === 'string' && /^(\d+\.?\d+?)%$/.test(c.width)) {
              obj[c.column] = c.width
            }
          }
        })
        return obj
      }
      return {}
    },
    sortConfig () {
      if (this.params && this.params.header === 'row' && Array.isArray(this.params.sort) && this.params.sort.length > 0) {
        return this.params.sort
      }
      return []
    }
  },
  watch: {
    params: {
      handler (value) {
        this.searchValue = ''
        this.activatedSort = {}
      },
      deep: true,
      immediate: true
    },
    sourceData: {
      handler () {
        this.initData()
      },
      deep: true,
      immediate: true
    },
    searchValue (value) {
      if (!this.enableSearch) return
      this.filter()
    },
    headerInfirstRow (value) {
      if (value && this.tableData && this.tableData.rows.length) {
        this.tableData.rows[0].checked = false
        this.tableData.rows[0].show = true
      }
    },
    enableSearch (newVal, oldVal) {
      if (oldVal && !newVal) {
        this.showAll()
      }
    }
  },
  beforeDestroy () {
    this.tableData = {}
  },
  methods: {
    initData () {
      if (this.params && is2DMatrix(this.sourceData)) {
        let table = { key: unique(`table-`), checked: false, rows: [] }
        for (let i = 0; i < this.sourceData.length; i++) {
          let tableRow = { key: unique(`table-`), checked: false, show: true, index: i }
          tableRow.cells = this.sourceData[i].map(item => {
            return { data: item, key: unique(`table-`), checked: false }
          })
          table.rows.push(tableRow)
        }
        this.tableData = table
      }
    },
    getCellStyle (columnIndex) {
      if (this.columnWidth[columnIndex]) {
        return {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: this.columnWidth[columnIndex]
        }
      } else {
        return {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%'
        }
      }
    },
    onCheckAll (tableRow) {
      if (!this.showCheck) return
      let allChecked = (tableRow.checked !== true)
      this.setAllRowChecked(allChecked)
      this.$emit('select-all', allChecked)
      this.$emit(
        'selection-change', 
        this.getCheckedRowDatas(true), 
        this.getCheckedRowIndexs(true),
        this.getCheckedRowNum(true)
      )
    },
    onCheckRow (tableRow, rowIndex) {
      if (!this.showCheck) return

      tableRow.checked = !tableRow.checked
      
      if (this.headerInfirstRow) {
        if (this.isAllRowChecked()) {
          this.tableData.rows[0].checked = true
        } else if (this.getCheckedRowNum() > 0) {
          this.tableData.rows[0].checked = 'indeterminate'
        } else {
          this.tableData.rows[0].checked = false
        }
      }

      this.$emit('select', tableRow.checked, rowIndex, this.sourceData[rowIndex])
      this.$emit(
        'selection-change', 
        this.getCheckedRowDatas(true), 
        this.getCheckedRowIndexs(true),
        this.getCheckedRowNum(true)
      )
    },
    onClickRow (tableRow, rowIndex) {
      this.$emit('row-click', rowIndex, this.sourceData[rowIndex])
    },
    onClickCell (tableCell, rowIndex, cellIndex) {
      this.$emit('cell-click', rowIndex, cellIndex, this.sourceData[rowIndex][cellIndex])
    },
    onUpload () {
      if (this.enableUpload) {
        let datas = this.sourceData
        if (this.showCheck) datas = this.getCheckedRowDatas(true)
        this.$emit('upload', datas)
        this.uploadHandler(datas)
      }
    },
    onDownload () {
      if (this.enableDownload) {
        let datas = this.sourceData
        if (this.showCheck) datas = this.getCheckedRowDatas(true)
        this.$emit('download', datas)
        this.downloadHandler(datas)
      }
    },
    onSort (index, value) {
      if (!(this.tableData && this.tableData.rows && this.tableData.rows.length > 0)) return
      if (!this.headerInfirstRow) return
      if (this.activatedSort[index] === value) return

      this.activatedSort = {}
      this.activatedSort[index] = value
      
      this.tableData.rows.sort((row1, row2) => {
        if (row1.index === 0) return -1
        if (row2.index === 0) return 1
        let data1 = row1.cells[index].data
        let data2 = row2.cells[index].data
        if (value === 'ascending') {
          return data1 > data2 ? 1 : -1
        } else {
          return data2 > data1 ? 1 : -1
        }
      })

      this.$emit('sort-change', index, value)
    },
    filter () {
      if (!(this.enableSearch && this.tableData && this.tableData.rows)) return
      this.tableData.rows.forEach(row => {
        if (row && row.cells) {
          if (!this.searchValue) {
            return row.show = true
          }
          let matched = row.cells.some(cell => {
            return String(cell.data).toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase())
          })
          row.show = !!matched
        }
      })
    },
    showAll () {
      if (!(this.tableData && this.tableData.rows)) return
      this.tableData.rows.forEach(row => {
        row ? row.show = true : ''
      })
    },
    // 选中的行数。 includeWhenHeaderInfirstRow: 是否检查第一行表头
    getCheckedRowNum (includeWhenHeaderInfirstRow = false) {
      if (!this.showCheck) return 0

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let num = 0
        this.tableData.rows.forEach((row, index) => {
          if (index === 0 && this.headerInfirstRow) {
            if (!includeWhenHeaderInfirstRow) return
            if (row.checked !== false) return (num++)
          }
          if (row.checked) num++
        })
        return num
      }

      return 0
    },
    // 获取选中的行 [{ row }]
    getCheckedRows () {
      if (!this.showCheck) return []

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        return this.tableData.rows.filter((row, index) => {
          if (index === 0 && this.headerInfirstRow) return false
          return row.checked
        })
      }

      return []
    },
    // 获取选中的行（索引）。includeWhenHeaderInfirstRow: 是否检查第一行表头
    getCheckedRowIndexs (includeWhenHeaderInfirstRow = false) {
      if (!this.showCheck) return []

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let indexs = []
        this.tableData.rows.forEach((row, index) => {
          if (index === 0 && this.headerInfirstRow) {
            if (!includeWhenHeaderInfirstRow) return
            if (row.checked !== false) return indexs.push(row.index)
          }
          if (row.checked) indexs.push(row.index)
        })
        return indexs
      }

      return []
    },
    // 获取选中行的源数据（2DMatrix）。 includeWhenHeaderInfirstRow: 是否检查第一行表头
    getCheckedRowDatas (includeWhenHeaderInfirstRow = false) {
      if (!is2DMatrix(this.sourceData)) return []
      let indexs = this.getCheckedRowIndexs(includeWhenHeaderInfirstRow)
      let checkedDatas = this.sourceData.filter((s, i) => {
        return indexs.includes(i)
      })
      return checkedDatas || []
    },
    // 是否所有行均为选中
    isAllRowChecked () {
      if (!this.showCheck) return false

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        return this.tableData.rows.every((row, index) => {
          if (index === 0 && this.headerInfirstRow) return true
          return row.checked
        })
      }

      return false
    },
    // 设置所有行选中状态 true/false
    setAllRowChecked (checked) {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        this.tableData.rows.forEach((row, index) => {
          row.checked = !!checked
        })
      }
    }
  },
  components: { VueButton, VueInput }
}
</script>

<style lang="scss" scoped>
$borderColor: #DCDFE6;
$rowHeight: 30px;

.data-table{
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-family: Helvetica, Arial, 'Microsoft YaHei';
  font-size: 13px;
  color: #606266;
  overflow: hidden;
}
.table-body{
  box-sizing: border-box;
}
.table-body.border{
  border-top: 1px solid $borderColor;
  border-right: 1px solid $borderColor;
}

.table-row{
  height: $rowHeight;
  background-color: transparent;
  border-bottom: 1px solid $borderColor;
}
.table-row.is-header, 
.table-cell.is-header {
  font-weight: 600;
}

.table-row:hover{
  background-color: #F5F7FA;
}
.table-row.is-header:hover{
  background-color: transparent;
}

.table-check{
  box-sizing: border-box;
  height: 100%;
  padding: 0 8px;
  overflow: hidden;
  -webkit-flex: 0 0 50px;
  -ms-flex: 0 0 50px;
  flex: 0 0 50px;
}

.table-check-all,
.table-check-row{
  box-sizing: border-box;
  height: 14px;
  width: 14px;
  font-weight: 400;
  color: #606266;
  border: 1px solid $borderColor;
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  i.iconfont{
    font-size: 12px;
  }
}
.table-check-all:hover,
.table-check-row:hover{
  border-color: #409EFF;
}
.table-check-all{
  margin-right: 8px;
}
.table-check-all.is-checked,
.table-check-row.is-checked{
  border-color: #409EFF;
  background-color: #409EFF;
  color: #FFFFFF;
}

.table-cell{
  box-sizing: border-box;
  height: 100%;
  padding: 0 8px;
  overflow: hidden;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

.table-check.border,
.table-cell.border{
  border-left: 1px solid $borderColor;
}

.table-row,
.table-cell-content{
  position: relative;
  overflow: hidden;
  word-wrap: normal;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.table-tools{
  padding: 8px 0px;
}
.tools-upload, .tools-download{
  margin-right: 8px;
}
.tools-upload i.iconfont,
.tools-download i.iconfont{
  font-size: 18px;
}

.tools-search{
  width: 280px;
  margin-right: 8px;
}

.table-sort{
  width: 20px;
  height: $rowHeight;
  margin-left: 2px;
  position: relative;
  vertical-align: middle;
  .sort-btns{
    width: 0;
    height: 0;
    border: 5px solid transparent;
    position: absolute;
    left: 5px;
    cursor: pointer;
  }
  .sort-ascending{
    border-bottom-color: #C0C4CC;
    top: 4px;
  }
  .sort-descending{
    border-top-color: #C0C4CC;
    bottom: 4px;
  }
  .sort-ascending.activated{
    border-bottom-color: #409EFF;
  }
  .sort-descending.activated{
    border-top-color: #409EFF;
  }
}

</style>