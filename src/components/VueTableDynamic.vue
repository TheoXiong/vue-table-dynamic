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
        class="table"
        :class="{ 'border':tableBorder }"
        :style="{
          minWidth: minWidth + 'px',
          maxWidth: maxWidth + 'px'
        }"
      >
        <!-- Table Header -->
        <div 
          v-if="headerInfirstRow" 
          class="table-row flex-c is-header"
          :class="{ 'is-striped': rowStripe, 'border':tableBorder }"
          :style="{ height: rowHeight + 'px' }"
          @click="onClickRow(tableData.rows[0], 0)"
        >
          <div 
            v-if="showCheck" 
            class="table-check flex-c-c" 
            :class="{ 'border':tableBorder }"
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
            :class="{ 'border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn) }"
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
          </div>
        </div>
        <!-- Table Body -->
        <div class="table-body" :style="{ height: height }">
          <vuescroll :ops="scrollBarOpts" ref="vuescroll">
            <div v-for="(tableRow, i) in tableData.rows" :key="i"> 
              <div 
                v-show="tableRow.show && !(i === 0 && headerInfirstRow)" 
                class="table-row flex-c"
                :class="{ 'is-striped': (rowStripe && i % 2 === 0), 'border':tableBorder }"
                :style="{ height: rowHeight + 'px' }"
                @click="onClickRow(tableRow, tableRow.index)"
              >
                <div 
                  v-if="showCheck" 
                  class="table-check flex-c-c" 
                  :class="{ 'border':tableBorder }"
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
                  :class="{ 'border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn ) }"
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
          </vuescroll>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { unemptyArray, is2DMatrix } from '../utils/array.js'
import { unique } from '../utils/unique.js'
import vuescroll from 'vuescroll'
import VueButton from './VueButton.vue'
import VueInput from './VueInput.vue'
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
      scrollBarOpts: {
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: '#DFDFDF',
          opacity: 0.8
        }
      }
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
    // params.enableUpload: (Boolean) 启用上传功能。默认禁用
    // params.onUpload: (Function) 点击上传时的回调
    // params.enableDownload: (Boolean) 启用下载功能。默认禁用
    // params.onDownload: (Function) 点击下载时的回调
    // params.enableSearch: (Boolean) 启用搜索功能。默认禁用
    // params.minWidth: (Number) table最小宽度。默认300
    // params.maxWidth: (Number) table最大宽度。默认1000
    // params.height: (Number) table高度。默认9999
    // params.rowHeight: (Number) table row高度。默认30
    // params.columnWidth: (Array) 指定某一列或某几列的宽度，剩余列宽度均分. [{column: 0, width: 80}, {column: 1, width: '20%'}]
    // params.sort: (Array) 指定以某列为基准排序。如指定第1列和第二列可排序：[0, 1]。 只在配置了第一行作为表头时有效
    // params.edit: (Object) 配置可编辑的 行/列/表单元。 如：{ row: [2, 3, ... ], column: [3, 4, ... ], cell: [[4, 4], [5, 6], ... ] } ；负数表示倒序（如-1为最后1行/列）；row: 'all' 所有行
    //                      编辑会改变表格显示的数据，不会改变传入的源数据。调用组件方法获取表格数据时，返回编辑后的数据。表头不可编辑。默认禁用
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
      this.filter(value)
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
    this.activatedSort = {}
  },
  methods: {
    /**
   * @function 初始化Table数据
   */
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
   * @function 点击上传
   */
    onUpload () {
      if (this.enableUpload) {
        let datas = []
        if (this.showCheck) {
          datas = this.getCheckedRowDatas(true)
        } else {
          datas = this.getData()
        }

        this.$emit('upload', datas)
        this.uploadHandler(datas)
      }
    },
    /**
   * @function 点击下载
   */
    onDownload () {
      if (this.enableDownload) {
        let datas = []
        if (this.showCheck) {
          datas = this.getCheckedRowDatas(true)
        } else {
          datas = this.getData()
        }

        this.$emit('download', datas)
        this.downloadHandler(datas)
      }
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
    },
    /**
   * @function 过滤行
   * @param {String} searchValue 搜索匹配关键字
   */
    filter (searchValue) {
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
    },
    /**
   * @function 取消过滤，显示所有行
   */
    showAll () {
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
    }
  },
  components: { VueButton, VueInput, vuescroll }
}
</script>

<style lang="scss" scoped>
$borderColor: #DCDFE6;

.data-table{
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-family: Helvetica, Arial, 'Microsoft YaHei';
  font-size: 13px;
  color: #606266;
  overflow: hidden;
}
.table{
  box-sizing: border-box;
}
.table.border{
  border-top: 1px solid $borderColor;
}

.table-row{
  background-color: transparent;
}
.table-row.is-header, 
.table-cell.is-header {
  font-weight: 600;
}
.table-row.is-striped{
  background-color: #F9F9F9;
}
.table-row.border{
  border-right: 1px solid $borderColor;
}

.table-row:hover{
  background-color: #F5F7FA;
}

.table-check{
  box-sizing: border-box;
  height: 100%;
  padding: 0 8px;
  border-bottom: 1px solid $borderColor;
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
  border-bottom: 1px solid $borderColor;
  overflow: hidden;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

.table-check.border,
.table-cell.border{
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