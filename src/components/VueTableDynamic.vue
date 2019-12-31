<template>
  <div class="v-table-dynamic">
    <div 
      v-if="tableData && tableData.rows && tableData.rows.length > 0"
      :style="{ minWidth: minWidth + 'px', maxWidth: maxWidth + 'px' }"
    >
      <!-- Table Tools -->
      <div class="v-table-tools flex-c-s" v-if="enableTools">
        <vue-input v-if="enableSearch" class="tools-search" v-model="searchValue" placeholder="Search">
          <i class="iconfont iconsearch" slot="prefix"></i>
        </vue-input>
      </div>
      <div 
        class="v-table"
        :class="{ 'v-show-border':tableBorder }"
        :style="{ minWidth: minWidth + 'px', maxWidth: maxWidth + 'px' }"
      >
        <!-- Table Header -->
        <div 
          v-if="headerInfirstRow" 
          class="v-table-row flex-c is-header"
          :class="{ 'is-striped': rowStripe, 'v-show-border':tableBorder }"
          :style="{ height: rowHeight + 'px' }"
          @click="onClickRow(tableData.rows[0], 0)"
        >
          <div 
            v-if="showCheck" 
            class="table-check flex-c-c" 
            :class="{ 'v-show-border':tableBorder }"
            :style="{ backgroundColor: isHighlighted(0, NaN) ? highlightedColor : 'transparent' }"
          > 
            <div 
              class="table-check-all flex-c-c"
              :class="{ 'is-checked': tableData.rows[0].checked }"
              @click.stop="onCheckAll(tableData.rows[0])"
            >
              <i class="iconfont iconcheck" v-show="tableData.rows[0].checked === true"></i> 
              <i class="iconfont iconminus" v-show="tableData.rows[0].checked === 'indeterminate'"></i>
            </div>
          </div>
          <div 
            v-for="(tableCell, j) in tableData.rows[0].cells" :key="j" 
            class="table-cell flex-c-s" 
            :class="{ 'v-show-border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn) }"
            :style="getCellStyle(0, j)"
            @click="onClickCell(tableCell, 0, j)"
          >
            <span class="table-cell-content">
              {{ tableCell.data }}
            </span>
            <span v-if="sortConfig.includes(j)" class="table-sort flex-dir-column" :style="{ height: rowHeight + 'px' }">
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
            <span 
              v-if="filterConfig[j]" 
              class="table-filter flex-c-c" 
              :style="{ height: rowHeight + 'px' }" 
            >
              <filter-panel 
                :content="filterConfig[j].content" 
                @filter="(checked) => { onFilter(j, checked, filterConfig[j]) }"
                @reset="clearFilter(j)"
              >
                <i slot="reference" class="iconfont icondown"></i>
              </filter-panel>
            </span>
          </div>
        </div>
        <!-- Table Body -->
        <div class="v-table-body" :style="{ height: height }">
          <vue-scrollbar ref="scrollbar">
            <div v-for="(tableRow, i) in tableData.rows" :key="i"> 
              <div
                v-show="tableRow.show && !tableRow.filtered && !(pagination && !tableRow.inPage) && !(i === 0 && headerInfirstRow)" 
                class="v-table-row flex-c"
                :class="{ 
                  'is-striped': (rowStripe && i % 2 === 0), 
                  'v-show-border':tableBorder
                }"
                :style="{ height: rowHeight + 'px' }"
                @click="onClickRow(tableRow, tableRow.index)"
              >
                <div 
                  v-if="showCheck" 
                  class="table-check flex-c-c" 
                  :class="{ 'v-show-border':tableBorder }"
                  :style="{ backgroundColor: isHighlighted(tableRow.index, NaN) ? highlightedColor : 'transparent' }"
                > 
                  <div 
                    class="table-check-row flex-c-c"
                    :class="{ 'is-checked': tableRow.checked }"
                    @click.stop="onCheckRow(tableRow, tableRow.index)"
                  >
                    <i class="iconfont iconcheck" v-show="tableRow.checked"></i>
                  </div>
                </div>
                <div 
                  v-for="(tableCell, j) in tableRow.cells" :key="j" 
                  class="table-cell flex-c-s" 
                  :class="{ 'v-show-border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn ) }"
                  :style="getCellStyle(tableRow.index, j)"
                  @click="onClickCell(tableCell, tableRow.index, j)"
                >
                  <span 
                    class="table-cell-content"
                    :class="{'fill-width': i !== 0}"
                    :contenteditable="isEditable(tableRow.index, j)"
                    :id="tableCell.key"
                    @blur="onCellBlur(tableCell, tableRow.index, j)"
                    @keydown.enter.stop.prevent="onCellKeyEnter"
                  >
                    {{ tableCell.data }}
                  </span>
                </div>
              </div>
            </div>
          </vue-scrollbar>
        </div>
      </div>
      <!-- Table Pagination -->
      <div class="table-pagination" v-if="pagination">
        <vue-pagination
          :page-size="pageSize"
          :page-sizes="pageSizes"
          :total="totalPages" 
          :disabled="!pagination"
          @current-page="onPageChange"
          @size="onPageSizeChange"
          ref="tablePagination"
        >
        </vue-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { unemptyArray, is2DMatrix } from '../utils/array.js'
import { unique } from '../utils/unique.js'
import VueScrollbar from './scrollbar/VueScrollbar'
import VueInput from './VueInput.vue'
import FilterPanel from './FilterPanel.vue'
import VuePagination from './VuePagination.vue'
import '../assets/css/flex.css'
import '../assets/iconfont/iconfont.css'
const trim = require('lodash.trim')

export default {
  name: 'VueTableDynamic',
  data () {
    return {
      tableData: {},
      searchValue: '',
      activatedSort: {},
      totalPages: 0,
      pageSize: 0
    }
  },
  props: {
    // 表格相关信息
    // params.data: （二维矩阵）表格数据
    // params.header: (String) 表头类型。 'row': 第一行作为表头； 'column': 第一列作为表头； ''/'none'/other: 无表头。 默认无
    // params.border: (Boolean) 是否带边框。默认不带
    // params.stripe: (Boolean) 行背景间隔条纹显示。默认false
    // params.highlight: (Object) 配置高亮背景的 行/列/表单元
    // params.highlightedColor: (String) 高亮背景的颜色。
    // params.showCheck: (Boolean) 是否在第一列前显示多选（勾选）框。 默认不显示。  注：仅当params.header为'row时，第一行第一列为'全选'框，否则第一列均为当前行的勾选框
    // params.enableSearch: (Boolean) 启用搜索功能。默认禁用
    // params.minWidth: (Number) table最小宽度。默认300
    // params.maxWidth: (Number) table最大宽度。默认1000
    // params.height: (Number) table高度。
    // params.rowHeight: (Number) table row高度。默认30
    // params.columnWidth: (Array) 指定某一列或某几列的宽度，剩余列宽度均分. [{column: 0, width: 80}, {column: 1, width: '20%'}]
    // params.sort: (Array) 指定以某列为基准排序。如指定第1列和第二列可排序：[0, 1]。 只在配置了第一行作为表头时有效
    // params.edit: (Object) 配置可编辑的 行/列/表单元。 如：{ row: [2, 3, ... ], column: [3, 4, ... ], cell: [[4, 4], [5, 6], ... ] } ；负数表示倒序（如-1为最后1行/列）；row: 'all' 所有行
    //                      编辑会改变表格显示的数据，不会改变传入的源数据。调用组件方法获取表格数据时，返回编辑后的数据。表头不可编辑。默认禁用
    // params.filter: (Array) 配置基于列的筛选。如： [{column: 0, content: [{text: '> 5', value: 5}], method: (value, tableCell) => { ... }}]
    // params.pagination: (Boolean) 是否启用分页功能。默认false
    // params.pageSize: (Number) 每页显示条数
    // params.pageSizes: (Array) 每页显示条数的可选值
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
    rowStripe () {
      return !!(this.params && this.params.stripe)
    },
    highlightConfig () {
      if (this.params && this.params.highlight && typeof this.params.highlight === 'object') {
        return this.params.highlight
      }
      return {}
    },
    highlightedColor () {
      if (this.params && this.params.highlightedColor && typeof this.params.highlightedColor === 'string') {
        return this.params.highlightedColor
      }
      return '#EBEBEF'
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
    enableSearch () {
      return !!(this.params && this.params.enableSearch)
    },
    enableTools () {
      return this.enableSearch
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
    rowHeight () {
      if (this.params && typeof this.params.rowHeight === 'number' && this.params.rowHeight >= 24) {
        return this.params.rowHeight
      }
      return 30
    },
    height () {
      if (this.params && typeof this.params.height === 'number' && this.params.height > this.rowHeight) {
        return (this.params.height - this.rowHeight) + 'px'
      }
      return 'auto'
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
      if (this.params && this.params.header === 'row' && Array.isArray(this.params.sort)) {
        return this.params.sort
      }
      return []
    },
    editConfig () {
      if (this.params && this.params.edit && typeof this.params.edit === 'object') {
        return this.params.edit
      }
      return {}
    },
    filterConfig () {
      if (this.params && unemptyArray(this.params.filter)) {
        let filterObj = {}
        this.params.filter.forEach(f => {
          if (f && typeof f.column === 'number' && f.column >= 0 && typeof f.method === 'function' && unemptyArray(f.content)) {
            if (f.content.every(c => { return (c && typeof c.text === 'string' && typeof c.value !== 'undefined') })) {
              let content = f.content.map(c => { return { ...c, checked: false, key: unique(`content-`) } })
              filterObj[f.column] = { ...f, content, key: unique(`filter-`) }
            }
          }
        })
        return filterObj
      }
      return {}
    },
    pagination () {
      return !!(this.params && this.params.pagination)
    },
    pageSizeConfig () {
      if (this.params && typeof this.params.pageSize === 'number' && this.params.pageSize > 0) {
        return this.params.pageSize
      }
      return 10
    },
    pageSizes () {
      if (Array.isArray(this.params.pageSizes)) {
        return this.params.pageSizes
      }
      return [10, 20, 50, 100]
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
      this.search(value)
    },
    headerInfirstRow (value) {
      if (value && this.tableData && this.tableData.rows.length) {
        this.tableData.rows[0].checked = false
        this.tableData.rows[0].show = true
      }
    },
    enableSearch (newVal, oldVal) {
      if (oldVal && !newVal) {
        this.clearSearch()
      }
    },
    pageSizeConfig: {
      handler (v) {
        if (v > 0 && this.pageSize !== v && (this.params && this.params.pagination)) {
          this.pageSize = v
        }
      },
      immediate: true
    }
  },
  beforeDestroy () {
    this.tableData = {}
    this.activatedSort = {}
  },
  methods: {
    /**
   * @function 初始化Table数据
   */
    initData () {
      if (this.params && is2DMatrix(this.sourceData)) {
        let table = { key: unique(`table-`), checked: false, rows: [], filteredRows: {} }
        for (let i = 0; i < this.sourceData.length; i++) {
          let tableRow = { key: unique(`table-`), checked: false, show: true, filtered: false, inPage: false, index: i }
          tableRow.cells = this.sourceData[i].map(item => {
            return { data: item, key: unique(`table-`), checked: false }
          })
          table.rows.push(tableRow)
        }
        this.tableData = table
        this.$nextTick(this.updatePagination)
      }
    },
    /**
   * @function 更新分页数据
   */
    updatePagination () {
      if (!this.pagination) return
      if (!(this.tableData && this.tableData.rows && this.tableData.rows.length > 0)) return
      const rowNum = this.getActivatedRowNum()
      if (rowNum === this.totalPages) {
        if (this.$refs && this.$refs.tablePagination) {
          this.$refs.tablePagination.initPages(this.totalPages)
        }
      } else {
        this.totalPages = rowNum
      }
    },
    /**
   * @function 当前页编号改变
   * @param {Number} page 页编号
   */
    onPageChange (page) {
      if (!this.pagination) return
      if (!(this.tableData && this.tableData.rows && this.tableData.rows.length > 0)) return
      let start = (page - 1) * this.pageSize
      let end = start + this.pageSize

      let rows = this.tableData.rows.filter((row, index) => {
        if (index === 0 && this.headerInfirstRow) return false
        return row.show && !row.filtered 
      })
      rows.forEach((row, index) => {
        row.inPage = !!(index >= start && index < end)
      })
    },
    /**
   * @function 每页显示条数切换事件
   */
    onPageSizeChange (size) {
      if (!this.pagination) return
      this.pageSize = size
    },
    /**
   * @function 获取Cell的样式数据
   */
    getCellStyle (rowIndex, columnIndex) {
      let style = {}
      if (this.isHighlighted(rowIndex, columnIndex)) {
        style.backgroundColor = this.highlightedColor
      }

      if (this.columnWidth[columnIndex]) {
        return {
          ...style,
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: this.columnWidth[columnIndex]
        }
      } else {
        return {
          ...style,
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%'
        }
      }
    },
    /**
   * @function 检查Cell是否可编辑
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   */
    isEditable (rowIndex, columnIndex) {
      if (!(this.editConfig && (this.editConfig.row || this.editConfig.column || this.editConfig.cell))) return false
      if (this.headerInfirstRow && rowIndex === 0) return false
      if (this.headerInfirstColumn && columnIndex === 0) return false
      
      if (this.editConfig.row === 'all' || this.editConfig.column === 'all' || this.editConfig.cell === 'all') return true

      if (Array.isArray(this.editConfig.row) &&
        (this.editConfig.row.includes(rowIndex) || this.editConfig.row.includes(rowIndex - this.sourceData.length))) {
        return true
      }

      if (Array.isArray(this.editConfig.column) &&
        (this.editConfig.column.includes(columnIndex) || this.editConfig.column.includes(columnIndex - this.sourceData[0].length))) {
        return true
      }

      if (Array.isArray(this.editConfig.cell) && this.editConfig.cell.length > 0) {
        return this.editConfig.cell.some(item => {
          return (Array.isArray(item) && item.length >= 2 && (item[0] === rowIndex || item[0] === (rowIndex - this.sourceData.length)) && (item[1] === columnIndex || item[1] === (columnIndex - this.sourceData[0].length)))
        })
      }

      return false
    },
    isHighlighted (rowIndex, columnIndex) {
      if (!(this.highlightConfig && (this.highlightConfig.row || this.highlightConfig.column || this.highlightConfig.cell))) return false

      if (Array.isArray(this.highlightConfig.row) &&
        (this.highlightConfig.row.includes(rowIndex) || this.highlightConfig.row.includes(rowIndex - this.sourceData.length))) {
        return true
      }

      if (Array.isArray(this.highlightConfig.column) &&
        (this.highlightConfig.column.includes(columnIndex) || this.highlightConfig.column.includes(columnIndex - this.sourceData[0].length))) {
        return true
      }

      if (Array.isArray(this.highlightConfig.cell) && this.highlightConfig.cell.length > 0) {
        return this.highlightConfig.cell.some(item => {
          return (Array.isArray(item) && item.length >= 2 && (item[0] === rowIndex || item[0] === (rowIndex - this.sourceData.length)) && (item[1] === columnIndex || item[1] === (columnIndex - this.sourceData[0].length)))
        })
      }

      return false
    },
    /**
   * @function 勾选所有Row
   * @param {Object} tableRow 第一行表头
   */
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
    /**
   * @function 勾选单个Row
   * @param {Object} tableRow Row数据对象
   * @param {Number} rowIndex 行索引
   */
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

      this.$emit('select', tableRow.checked, rowIndex, this.getRowDataFromTableRow(tableRow))
      this.$emit(
        'selection-change', 
        this.getCheckedRowDatas(true), 
        this.getCheckedRowIndexs(true),
        this.getCheckedRowNum(true)
      )
    },
    /**
   * @function 单击Row事件
   * @param {Object} tableRow Row数据对象
   * @param {Number} rowIndex 行索引
   */
    onClickRow (tableRow, rowIndex) {
      this.$emit('row-click', rowIndex, this.getRowDataFromTableRow(tableRow))
    },
    /**
   * @function 单击Cell事件
   * @param {Object} tableCell Cell数据对象
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   */
    onClickCell (tableCell, rowIndex, columnIndex) {
      this.$emit('cell-click', rowIndex, columnIndex, tableCell.data)
    },
    /**
   * @function Cell失去焦点
   * @param {Object} tableCell Cell数据对象
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   */
    onCellBlur (tableCell, rowIndex, columnIndex) {
      if (!this.isEditable(rowIndex, columnIndex)) return

      let cellEle = document.querySelector(`#${tableCell.key}`)
      if (cellEle && (tableCell.data !== trim(cellEle.innerHTML))) {
        tableCell.data = trim(cellEle.innerHTML)
        this.$emit('cell-change', rowIndex, columnIndex, tableCell.data)
      }
    },
    onCellKeyEnter (e) {
    },
    /**
   * @function 基于某一列数据排序
   * @param {Number} index 列索引
   * @param {String} value ascending：升序； descending：降序
   */
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
      this.$nextTick(this.updatePagination)
    },
    /**
   * @function 基于某一列数据筛选
   * @param {Number} columnIndex 列索引
   * @param {Array} checked 选中的筛选条件
   * @param {Object} config 该列的筛选配置
   */
    onFilter (columnIndex, checked, config) {
      if (!(this.tableData && this.tableData.rows)) return

      let filteredArr = []
      this.tableData.rows.forEach((row) => {
        if (row && row.cells && row.cells[columnIndex]) {
          let matched = checked.some(item => {
            return config.method(item.value, row.cells[columnIndex])
          })
          matched ? '' : filteredArr.push(row.index)
        }
      })
      this.tableData.filteredRows[columnIndex] = filteredArr

      this.updateFilteredRows()
    },
    /**
   * @function 更新行筛选状态
   */
    updateFilteredRows () {
      this.tableData.rows.forEach(row => {
        row.filtered = Object.keys(this.tableData.filteredRows).some(key => {
          return this.tableData.filteredRows[key].includes(row.index)
        })
        row.filtered = !!row.filtered
      })
      this.$nextTick(this.updatePagination)
    },
    /**
   * @function 清除筛选状态
   * @param {Number} columnIndex 列索引。传入列索引时，对该列清除；不传索引时，清除所有筛选
   */
    clearFilter (columnIndex) {
      if (typeof columnIndex === 'number') {
        delete this.tableData.filteredRows[columnIndex]
        if (this.filterConfig && this.filterConfig[columnIndex]) {
          this.filterConfig[columnIndex].content.forEach(c => { c.checked = false })
        }
      } else {
        this.tableData.filteredRows = {}
        Object.keys(this.filterConfig).forEach(key => {
          this.filterConfig[key].content.forEach(c => { c.checked = false })
        })
      }
  
      this.updateFilteredRows()
    },
    /**
   * @function 按关键字搜索，显示匹配的行
   * @param {String} searchValue 关键字
   */
    search (searchValue) {
      if (!(this.tableData && this.tableData.rows)) return

      searchValue = String(searchValue)
      this.tableData.rows.forEach(row => {
        if (row && row.cells) {
          if (!searchValue) {
            return row.show = true
          }
          let matched = row.cells.some(cell => {
            return String(cell.data).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
          })
          row.show = !!matched
        }
      })
      this.$nextTick(this.updatePagination)
    },
    /**
   * @function 取消搜索过滤
   */
    clearSearch () {
      if (!(this.tableData && this.tableData.rows)) return
      this.tableData.rows.forEach(row => {
        row ? row.show = true : ''
      })
    },
    /**
   * @function 获取选中的行数
   * @param {Boolean} includeWhenHeaderInfirstRow 是否检查第一行表头。默认false
   */
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
    /**
   * @function 获取选中的行（排序前）的原始索引。返回的索引列表与是否排序无关
   * @param {Boolean} includeWhenHeaderInfirstRow 是否检查第一行表头。默认false
   */
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
    /**
   * @function 获取选中行的数据（2DMatrix）
   * @param {Boolean} includeWhenHeaderInfirstRow 是否检查第一行表头
   */
    getCheckedRowDatas (includeWhenHeaderInfirstRow = false) {
      let indexs = this.getCheckedRowIndexs(includeWhenHeaderInfirstRow)
      let checkedDatas = this.getData(indexs)
      return checkedDatas || []
    },
    /**
   * @function 获取表格最新数据。 可指定只包含指定行, 不指定则包含全部数据。 行顺序为初始顺序
   * @param {Array} rowIndexs 指定行。如：[ 0, 1, 2, ... ]
   */
    getData (rowIndexs) {
      let matrix = []
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let tmpRows = {}
        this.tableData.rows.forEach((row, index) => {
          if (Array.isArray(rowIndexs)) {
            rowIndexs.includes(row.index) ? tmpRows[row.index] = row : ''
          } else {
            tmpRows[row.index] = row
          }
        })
        for (let i = 0; i < this.tableData.rows.length; i++) {
          let rowData = this.getRowDataFromTableRow(tmpRows[i])
          rowData.length > 0 ? matrix.push(rowData) : ''
        }
      }
      return matrix
    },
    /**
   * @function 根据行索引获取指定行的最新数据
   * @param {Number} rowIndex 行索引
   * @param {Boolean} isCurrent 索引是否为排序后的索引。默认false，即原始索引
   */
    getRowData (rowIndex, isCurrent = false) {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let row
        if (isCurrent) {
          row = this.tableData.rows[rowIndex]
        } else {
          row = this.tableData.rows.find(r => { return r.index === rowIndex })
        }
        return this.getRowDataFromTableRow(row)
      }
      return []
    },
    /**
   * @function 根据行和列索引获取指定Cell单元最新数据
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   * @param {Boolean} isCurrent 行索引是否为排序后的索引。默认false，即原始索引
   */
    getCellData (rowIndex, columnIndex, isCurrent = false) {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let row
        if (isCurrent) {
          row = this.tableData.rows[rowIndex]
        } else {
          row = this.tableData.rows.find(r => { return r.index === rowIndex })
        }
        if (!(row && unemptyArray(row.cells))) return ''

        let cell = row.cells[columnIndex]
        if (cell && typeof cell.data !== 'undefined') return cell.data
        return ''
      }
      return ''
    },
    /**
   * @function 根据tableRow(内部行对象)获取该行的数据。{ key: 'xxx', cells:[ ... ] } ==> [ ... ]
   * @param {Number} tableRow 内部行对象。{ key: 'xxx', cells:[ ... ] }
   */
    getRowDataFromTableRow (tableRow) {
      let rowData = []
      if (!(tableRow && unemptyArray(tableRow.cells))) return rowData

      for (let i = 0; i < tableRow.cells.length; i++) {
        let cellData = tableRow.cells[i].data || ''
        rowData.push(cellData)
      }
      return rowData
    },
    /**
   * @function 获取仅包含选中行的数据对象集合，行数据为内部转换后的对象: {Object} tableRow
   */
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
    /**
   * @function 是否所有行均为选中
   */
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
    /**
   * @function 设置所有行选中状态
   * @param {Boolean} checked true/false
   */
    setAllRowChecked (checked) {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        this.tableData.rows.forEach((row, index) => {
          row.checked = !!checked
        })
      }
    },
    /**
   * @function 当前显示的行数
   */
    getActivatedRowNum (includeWhenHeaderInfirstRow = false) {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let num = 0
        this.tableData.rows.forEach((row, index) => {
          if (index === 0 && this.headerInfirstRow) {
            if (!includeWhenHeaderInfirstRow) return
            return (num++)
          }
          if (row.show && !row.filtered) num++
        })
        return num
      }

      return 0
    }
  },
  components: { VueInput, FilterPanel, VuePagination, VueScrollbar }
}
</script>

<style lang="scss" scoped>
$borderColor: #DCDFE6;

.v-table-dynamic{
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-family: Helvetica, Arial, 'Microsoft YaHei';
  font-size: 13px;
  color: #606266;
}
.v-table{
  box-sizing: border-box;
  border: none;
  // border-bottom: 1px solid $borderColor;
}

.v-table.v-show-border{
  border-top: 1px solid $borderColor;
}

.v-table-row{
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid $borderColor;
  background-color: transparent;
}
.v-table-row.is-header{
  overflow: hidden;
}
.v-table-row.is-header, 
.table-cell.is-header {
  font-weight: 600;
}
.v-table-row.is-striped{
  background-color: #F9F9F9;
}
.v-table-row.v-show-border{
  border-right: 1px solid $borderColor;
}

.v-table-row:hover{
  background-color: #F5F7FA;
}

.table-check{
  box-sizing: border-box;
  height: 100%;
  padding: 0 8px;
  overflow: hidden;
  -webkit-flex: 0 0 50px;
  -ms-flex: 0 0 50px;
  flex: 0 0 50px;
  border: none;
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
  border: none;
}

.table-check.v-show-border,
.table-cell.v-show-border{
  border-left: 1px solid $borderColor;
}

.table-cell-content{
  box-sizing: border-box;
  min-width: 12px;
  min-height: 10px;
  outline: 0;
  text-align:left;
}
.table-cell-content.fill-width{
  width: 100%;
}

.table-cell-content{
  position: relative;
  overflow: hidden;
  word-wrap: normal;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.v-table-tools{
  padding: 8px 0px;
}

.tools-search{
  width: 280px;
  margin-right: 8px;
}

.table-sort{
  width: 20px;
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

.table-filter{
  position: relative;
  margin-left: 2px;
  line-height: 100%;
  vertical-align: middle;
  cursor: pointer;
  color: #909399;
  i.iconfont{
    font-size: 12px;
  }
}

.table-pagination{
  padding: 8px 0px;
}

</style>