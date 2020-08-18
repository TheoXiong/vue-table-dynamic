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
        :class="{ 
          'v-show-border':tableBorder
        }"
        :style="{ minWidth: minWidth + 'px', maxWidth: maxWidth + 'px' }"
        @mouseenter="onMouseenterTable" 
        @mouseleave="onMouseleaveTable"
      >
        <!-- Table Header -->
        <div class="v-table-header-wrap">
          <div 
            v-if="headerInfirstRow" 
            class="v-table-row flex-c is-header"
            :class="{ 'is-striped': rowStripe, 'v-show-border': tableBorder, 'is-hovering': tableData.rows[0].hovering }"
            :style="{ 
              height: headerHeight + 'px', 
              minWidth: getRowMinWidth(),
              marginLeft: this.headerLeft * -1 +'px',
              backgroundColor: headerBgColor || (tableData.rows[0].hovering && rowHoverColor) || ''
            }"
            @mouseenter="onMouseenter(tableData.rows[0])" 
            @mouseleave="onMouseleave(tableData.rows[0])"
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
              class="table-cell flex-c" 
              :class="{ 'v-show-border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn) }"
              :style="getCellStyle(0, j)"
              @click="onClickCell(tableCell, 0, j)"
              @dblclick.exact.stop="onDblclickCell(tableCell, 0, j)"
              @contextmenu.stop.prevent="onContextmenuCell($event, tableCell, 0, j)"
            >
              <span 
                v-if="!(fixedColumn.includes(j))"
                class="table-cell-inner flex-c-s"
              >
                <span 
                  class="table-cell-content" 
                  :style="{ whiteSpace: whiteSpace, wordWrap: wordWrap, textOverflow: textOverflow, ...getStyleCustomized(0, j) }"
                >
                  {{ tableCell.data }}
                </span>
                <span v-if="sortConfig[j]" class="table-sort flex-dir-column" :style="{ height: '30px' }">
                  <i 
                    class="sort-btns sort-ascending"
                    :style="{
                      borderBottomColor: (activatedSort[j] && activatedSort[j] === 'ascending') ? activedColor : '#C0C4CC'
                    }"
                    @click.stop="onSort(j, 'ascending')"
                  >
                  </i>
                  <i 
                    class="sort-btns sort-descending" 
                    :style="{
                      borderTopColor: (activatedSort[j] && activatedSort[j] === 'descending') ? activedColor : '#C0C4CC'
                    }"
                    @click.stop="onSort(j, 'descending')"
                  >
                  </i>
                </span>
                <span 
                  v-if="filterConfig[j]" 
                  class="table-filter flex-c-c" 
                  :style="{ height: headerHeight + 'px' }" 
                >
                  <filter-panel 
                    :content="filterConfig[j].content" 
                    @filter="(checked) => { onFilter(j, checked, filterConfig[j]) }"
                    @reset="clearFilter(j)"
                  >
                    <i slot="reference" class="iconfont icondown"
                      :style="{ color: activatedFilter[j] ? activedColor : '#C0C4CC' }">
                    </i>
                  </filter-panel>
                </span>
              </span>
            </div>
          </div>
        </div>
        <!-- Table Body -->
        <div class="v-table-body" :style="{ height: height }">
          <vue-scrollbar
            x-bar-display="hidden"
            :y-bar-display="scrollbarDisplay"
            :size="7"
            :border-radius="0"
            :step="scrollStep"
            @scroll-x="onScrollX"
            @scroll-y="onScrollY"
            @size="onSize"
            ref="scrollbar" 
          >
            <div v-for="(tableRow, i) in tableData.activatedRows" :key="i" :style="{ minWidth: getRowMinWidth() }"> 
              <div
                v-show="tableRow.show && !tableRow.filtered && !(pagination && !tableRow.inPage) && !(i === 0 && headerInfirstRow)" 
                class="v-table-row flex-c"
                :class="{ 
                  'is-striped': (rowStripe && i % 2 === 0), 
                  'v-show-border': tableBorder,
                  'is-hovering': tableRow.hovering
                }"
                :style="{ height: rowHeight + 'px', minWidth: getRowMinWidth(), backgroundColor: tableRow.hovering ? rowHoverColor : '' }"
                @mouseenter="onMouseenter(tableRow)" 
                @mouseleave="onMouseleave(tableRow)"
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
                  @dblclick.exact.stop="onDblclickCell(tableCell, tableRow.index, j)"
                  @contextmenu.stop.prevent="onContextmenuCell($event, tableCell, tableRow.index, j)"
                >
                  <slot 
                    v-if="!(fixedColumn.includes(j))"
                    :name="'column-' + j" 
                    v-bind:props="{ cellData: tableCell.data, rowData: tableRow.cells, row: tableRow.index, column: j }"
                  >
                    <span
                      v-if="!(fixedColumn.includes(j))"
                      class="table-cell-content"
                      :class="{'fill-width': i !== 0}"
                      :style="{ whiteSpace: whiteSpace, wordWrap: wordWrap, textOverflow: textOverflow, ...getStyleCustomized(tableRow.index, j) }"
                      :contenteditable="isEditable(tableRow.index, j)"
                      :id="tableCell.key"
                      @blur="onCellBlur(tableCell, tableRow.index, j)"
                      @keydown.enter.stop.prevent="onCellKeyEnter"
                    >
                      {{ tableCell.data }}
                    </span>
                  </slot>
                </div>
              </div>
            </div>
          </vue-scrollbar>
        </div>
        <!-- Table Fixed -->
        <div class="v-table-fixed" :class="{ 'is-show-shadow': (scrollx !== 'left' )}"
          v-if="fixedWidth > 0" :style="{ width: fixedWidth + 'px' }"
        >
          <!-- Fixed Header -->
          <div 
            v-if="headerInfirstRow" 
            class="v-table-row flex-c is-header"
            :class="{ 'is-striped': rowStripe, 'v-show-border': tableBorder, 'is-hovering': tableData.rows[0].hovering }"
            :style="{ 
              height: headerHeight + 'px',
              minWidth: getRowMinWidth(),
              backgroundColor: headerBgColor || (tableData.rows[0].hovering && rowHoverColor) || ''
            }"
            @mouseenter="onMouseenter(tableData.rows[0])" 
            @mouseleave="onMouseleave(tableData.rows[0])"
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
              class="table-cell flex-c" 
              :class="{ 'v-show-border': tableBorder, 'is-header': (j === 0 && headerInfirstColumn) }"
              :style="getCellStyle(0, j)"
              @click="onClickCell(tableCell, 0, j)"
              @dblclick.exact.stop="onDblclickCell(tableCell, 0, j)"
              @contextmenu.stop.prevent="onContextmenuCell($event, tableCell, 0, j)"
            >
              <span 
                v-if="fixedColumn.includes(j)"
                class="table-cell-inner flex-c-s"
              >
                <span 
                  class="table-cell-content" 
                  :style="{ whiteSpace: whiteSpace, wordWrap: wordWrap, textOverflow: textOverflow, ...getStyleCustomized(0, j) }"
                >
                  {{ tableCell.data }}
                </span>
                <span v-if="sortConfig[j]" class="table-sort flex-dir-column" :style="{ height: '30px' }">
                  <i 
                    class="sort-btns sort-ascending" 
                    :style="{
                      borderBottomColor: (activatedSort[j] && activatedSort[j] === 'ascending') ? activedColor : '#C0C4CC'
                    }"
                    @click.stop="onSort(j, 'ascending')"
                  >
                  </i>
                  <i 
                    class="sort-btns sort-descending"
                    :style="{
                      borderTopColor: (activatedSort[j] && activatedSort[j] === 'descending') ? activedColor : '#C0C4CC'
                    }"
                    @click.stop="onSort(j, 'descending')"
                  >
                  </i>
                </span>
                <span 
                  v-if="filterConfig[j]" 
                  class="table-filter flex-c-c" 
                  :style="{ height: headerHeight + 'px' }" 
                >
                  <filter-panel 
                    :content="filterConfig[j].content" 
                    @filter="(checked) => { onFilter(j, checked, filterConfig[j]) }"
                    @reset="clearFilter(j)"
                  >
                    <i slot="reference" class="iconfont icondown" 
                      :style="{ color: activatedFilter[j] ? activedColor : '#C0C4CC' }"
                    >
                    </i>
                  </filter-panel>
                </span>
              </span>
            </div>
          </div>
          <!-- Fixed Body -->
          <div class="v-table-body v-table-body-fixed" :style="{ height: height }" ref="fixedBody">
            <div class="v-table-body-inner" :style="{ marginTop: fixedTop * -1 + 'px' }" @wheel="onFixedScroll" ref="fixedBodyInner">
              <div v-for="(tableRow, i) in tableData.activatedRows" :key="i" :style="{ minWidth: getRowMinWidth() }"> 
                <div
                  v-show="tableRow.show && !tableRow.filtered && !(pagination && !tableRow.inPage) && !(i === 0 && headerInfirstRow)" 
                  class="v-table-row flex-c"
                  :class="{ 
                    'is-striped': (rowStripe && i % 2 === 0), 
                    'v-show-border': tableBorder,
                    'is-hovering': tableRow.hovering
                  }"
                  :style="{ height: rowHeight + 'px', backgroundColor: tableRow.hovering ? rowHoverColor : '' }"
                  @mouseenter="onMouseenter(tableRow, true)" 
                  @mouseleave="onMouseleave(tableRow, true)"
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
                    @dblclick.exact.stop="onDblclickCell(tableCell, tableRow.index, j)"
                    @contextmenu.stop.prevent="onContextmenuCell($event, tableCell, tableRow.index, j)"
                  >
                    <slot 
                      v-if="fixedColumn.includes(j)"
                      :name="'column-' + j" 
                      v-bind:props="{ cellData: tableCell.data, rowData: tableRow.cells, row: tableRow.index, column: j }"
                    >
                      <span
                        v-if="fixedColumn.includes(j)"
                        class="table-cell-content"
                        :class="{'fill-width': i !== 0}"
                        :style="{ whiteSpace: whiteSpace, wordWrap: wordWrap, textOverflow: textOverflow, ...getStyleCustomized(tableRow.index, j) }"
                        :contenteditable="isEditable(tableRow.index, j)"
                        :id="tableCell.key"
                        @blur="onCellBlur(tableCell, tableRow.index, j)"
                        @keydown.enter.stop.prevent="onCellKeyEnter"
                      >
                        {{ tableCell.data }}
                      </span>
                    </slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Table left/right border -->
        <div class="v-table-left-line" v-if="tableBorder"></div>
        <div class="v-table-right-line" v-if="tableBorder"></div>
        <div class="v-table-scrollbar">
          <horizontal-scrollbar
            v-if="bodyWidth && bodyViewerWidth"
            :x-bar-display="scrollbarDisplay"
            :size="7"
            :border-radius="0"
            :viewer-width="bodyViewerWidth"
            :wrapper-width="bodyWidth"
            :scrolling="hMovement"
            @change-position="onChangePosition"
            ref="hscroll"
          >
          </horizontal-scrollbar>
        </div>
      </div>
      <!-- Table Pagination -->
      <div class="table-pagination" v-if="pagination">
        <vue-pagination
          :page-size="pageSize"
          :page-sizes="pageSizes"
          :total="totalPages" 
          :show-total="showTotal"
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
import { isPercentage } from '../utils/util.js'
import VueScrollbar from 'vue-scrollbar-simple'
import HorizontalScrollbar from './scrollbar/HorizontalScrollbar.vue'
import VueInput from './VueInput.vue'
import FilterPanel from './FilterPanel.vue'
import VuePagination from './VuePagination.vue'
import '../assets/css/flex.css'
import '../assets/iconfont/iconfont.css'
const trim = require('lodash.trim')

const wordWrapList = ['normal', 'break-word']
const whiteSpaceList = ['nowrap', 'normal', 'pre', 'pre-wrap', 'pre-line']
const textOverflowList = ['clip', 'ellipsis']
const scrollbarDisplayList = ['hover', 'show', 'hidden']

export default {
  name: 'VueTableDynamic',
  data () {
    return {
      tableData: {},
      searchValue: '',
      activatedSort: {},
      activatedFilter: {},
      totalPages: 0,
      pageSize: 0,
      headerLeft: 0,
      scrollStep: 40,
      scrollx: 'left',
      scrolly: 'top',
      fixedColumn: [],
      fixedWidth: 0,
      fixedTop: 0,
      bodyWidth: null,
      bodyViewerWidth: null,
      hMovement: 0
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
    // params.wordWrap: (String) 表格单元中文本的长单词换行 'normal/break-word'  默认normal
    // params.whiteSpace: (String) 表格单元中文本的空白处理 'nowrap/normal/pre/pre-wrap/pre-line'  默认nowrap
    // params.textOverflow: (String) 表格单元中文本溢出处理 'clip/ellipsis'  默认clip
    // params.showCheck: (Boolean) 是否在第一列前显示多选（勾选）框。 默认不显示。  注：仅当params.header为'row时，第一行第一列为'全选'框，否则第一列均为当前行的勾选框
    // params.enableSearch: (Boolean) 启用搜索功能。默认禁用
    // params.minWidth: (Number) table最小宽度。默认100
    // params.maxWidth: (Number) table最大宽度。默认10000
    // params.height: (Number) table高度。
    // params.headerHeight: (Number) table header高度。默认30
    // params.rowHeight: (Number) table row高度。默认30
    // params.columnWidth: (Array) 指定某一列或某几列的宽度，剩余列宽度均分. [{column: 0, width: 80}, {column: 1, width: '20%'}]
    // params.sort: (Array) 指定以某列为基准排序。如指定第1列和第二列可排序：[0, 1]。 只在配置了第一行作为表头时有效
    // params.edit: (Object) 配置可编辑的 行/列/表单元。 如：{ row: [2, 3, ... ], column: [3, 4, ... ], cell: [[4, 4], [5, 6], ... ] } ；负数表示倒序（如-1为最后1行/列）；row: 'all' 所有行
    //                      编辑会改变表格显示的数据，不会改变传入的源数据。调用组件方法获取表格数据时，返回编辑后的数据。表头不可编辑。默认禁用
    // params.filter: (Array) 配置基于列的筛选。如： [{column: 0, content: [{text: '> 5', value: 5}], method: (value, tableCell) => { ... }}]
    // params.activedColor: (string) 表头排序/过滤按钮激活后的颜色
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
    headerBgColor () {
      if (this.params && this.params.headerBgColor && typeof this.params.headerBgColor === 'string') {
        return this.params.headerBgColor
      }
      return ''
    },
    rowHoverColor () {
      if (this.params && this.params.rowHoverColor && typeof this.params.rowHoverColor === 'string') {
        return this.params.rowHoverColor
      }
      return ''
    },
    wordWrap () {
      if (this.params && this.params.wordWrap && wordWrapList.includes(this.params.wordWrap)) {
        return this.params.wordWrap
      }
      return wordWrapList[0]
    },
    whiteSpace () {
      if (this.params && this.params.whiteSpace && whiteSpaceList.includes(this.params.whiteSpace)) {
        return this.params.whiteSpace
      }
      return whiteSpaceList[0]
    },
    textOverflow () {
      if (this.params && this.params.textOverflow && textOverflowList.includes(this.params.textOverflow)) {
        return this.params.textOverflow
      }
      return textOverflowList[0]
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
      return 100
    },
    maxWidth () {
      if (this.params && typeof this.params.maxWidth === 'number' && this.params.maxWidth > 0) {
        return this.params.maxWidth
      }
      return 10000
    },
    headerHeight () {
      if (this.params && typeof this.params.headerHeight === 'number' && this.params.headerHeight >= 24) {
        return this.params.headerHeight
      }
      return 30
    },
    rowHeight () {
      if (this.params && typeof this.params.rowHeight === 'number' && this.params.rowHeight >= 24) {
        return this.params.rowHeight
      }
      return 30
    },
    height () {
      if (this.params && typeof this.params.height === 'number' && this.params.height > this.rowHeight) {
        if (this.headerInfirstRow) {
          return (this.params.height - this.headerHeight) + 'px'
        }
        return this.params.height + 'px'
      }
      return 'auto'
    },
    columnWidth () {
      if (this.params && unemptyArray(this.params.columnWidth)) {
        let obj = {}
        let percentageList = []

        this.params.columnWidth.forEach(c => {
          if (c && typeof c.column === 'number' && c.column >= 0) {
            if (typeof c.width === 'number' && c.width >= 0) {
              obj[c.column] = { value: c.width + 'px', type: 'absolute' }
            } else if (isPercentage(c.width)) {
              obj[c.column] = { value: c.width, type: 'percentage' }
              percentageList.push(c.width)
            }
          }
        })

        if (percentageList.length > 0) {
          let total = percentageList.reduce((t, p) => { return parseFloat(t) + parseFloat(p) })
          if (total > 100) {
            console.error(`The total percentage of column width must be less than 100%, current is ${total}%`)
            return {}
          }
        }

        return obj
      }
      return {}
    },
    fixedConfig () {
      if (this.params && typeof this.params.fixed === 'number' && this.params.fixed >= 0) {
        return this.params.fixed
      }
      return null
    },
    sortConfig () {
      if (this.params && this.params.header === 'row' && Array.isArray(this.params.sort)) {
        let conf = {}
        this.params.sort.forEach(s => {
          if (typeof s === 'number' && s >= 0) {
            conf[s] = {}
          } else if (s && typeof s === 'object' && typeof s.column === 'number' && (typeof s.ascending === 'function' || typeof s.descending === 'function')) {
            conf[s.column] = s
          }
        })

        return conf
      }
      return {}
    },
    editConfig () {
      if (this.params && this.params.edit && typeof this.params.edit === 'object') {
        return this.params.edit
      }
      return {}
    },
    styleConfig () {
      if (this.params && this.params.style && typeof this.params.style === 'object') {
        return this.params.style
      }
      return {}
    },
    activedColor () {
      if (this.params && this.params.activedColor && typeof this.params.activedColor === 'string') {
        return this.params.activedColor
      }
      return '#046FDB'
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
    },
    showTotal () {
      return !!(this.params && this.params.showTotal)
    },
    scrollbarDisplay () {
      if (this.params && scrollbarDisplayList.includes(this.params.scrollbar)) {
        return this.params.scrollbar
      }
      return 'show'
    }
  },
  watch: {
    params: {
      handler (value) {
        this.searchValue = ''
        this.activatedSort = {}
        this.activatedFilter = {}
      },
      deep: true,
      immediate: true
    },
    sourceData: {
      handler (value) {
        this.initData(value)
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
    },
    showCheck (value) {
      this.$nextTick(this.updateFixedColumn)
    },
    fixedConfig: {
      handler () {
        this.$nextTick(this.updateFixedColumn)
      },
      immediate: true
    },
    columnWidth (value) {
      this.$nextTick(this.updateFixedColumn)
    }
  },
  beforeDestroy () {
    this.tableData = {}
    this.activatedSort = {}
    this.activatedFilter = {}
  },
  methods: {
    /**
   * @function 初始化Table数据
   */
    initData (sourceData) {
      if (this.params && is2DMatrix(sourceData)) {
        let table = { key: unique(`table-`), checked: false, rows: [], activatedRows: [], filteredRows: {} }
        for (let i = 0; i < sourceData.length; i++) {
          let tableRow = { key: unique(`table-`), checked: false, show: true, filtered: false, inPage: false, hovering: false, index: i }
          tableRow.cells = sourceData[i].map(item => {
            return { data: item, key: unique(`table-`), checked: false }
          })
          table.rows.push(tableRow)
        }
        this.tableData = table

        if (this.pagination) {
          this.$nextTick(this.updatePagination)
        } else {
          this.tableData.activatedRows = this.tableData.rows
        }
      }
    },
    updateActivatedRows () {
      if (!(this.tableData && this.tableData.rows && this.tableData.rows.length > 0)) return

      this.tableData.activatedRows = this.tableData.rows.filter((row, index) => {
        if (index === 0 && this.headerInfirstRow) return true
        return (row.show && !row.filtered && !(this.pagination && !row.inPage))
      })
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

      this.$nextTick(this.updateActivatedRows)
    },
    /**
   * @function 每页显示条数切换事件
   */
    onPageSizeChange (size) {
      if (!this.pagination) return
      this.pageSize = size
    },
    /**
   * @function 跳转到目标页
   * @param {Number} tagetPage 页编号
   */
    toPage (tagetPage) {
      if (!this.pagination) return
      if (!(typeof tagetPage === 'number' && tagetPage > 0)) return

      if (this.$refs && this.$refs.tablePagination) {
        this.$refs.tablePagination.toPage(tagetPage)
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
          flexBasis: this.columnWidth[columnIndex].value
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
     * @function 根据输入列宽配置计算行最小宽度
     *           1. 没有配置列宽：继承父容器宽度
     *           2. 仅配置了部分（或全部）列宽为绝对像素值：配置的像素值之和 + 剩余列 * 列最小宽度 + 多选列宽度(如果启用了多选)
     *           3. 全部列均配置为相对百分比：继承父容器宽度
     *           4. 部分列配置为相对百分比，部分列配置为绝对像素值：(配置的像素值之和(如果有) + 剩余列(如果有) * 列最小宽度 + 多选列宽度(如果启用了多选)) * 100 / (100 - 配置的百分比之和)
     */
    getRowMinWidth () {
      let columnMinWidth = 80
      let checkColumnWidth = this.showCheck ? 50 : 0
      let columnNum = this.getColumnNum()
      let defaultMinWidth = '100%'
      let offset = 2
      let keys = Object.keys(this.columnWidth)

      if (!(keys.length > 0)) {
        return defaultMinWidth
      } else {
        let abs = { total: 0, count: 0 } // 绝对像素值
        let pct = { total: 0, count: 0 } // 相对百分比

        for (let i = 0; i < keys.length; i++) {
          if (keys[i] >= columnNum) continue

          let conf = this.columnWidth[keys[i]]
          if (conf.type === 'absolute') {
            abs.total += parseFloat(conf.value)
            abs.count += 1
          } else if (conf.type === 'percentage') {
            pct.total += parseFloat(conf.value)
            pct.count += 1
          }
        }

        if (pct.count === 0) {
          let remainNum = columnNum - abs.count
          if (remainNum < 0) return defaultMinWidth
          return Math.ceil(abs.total + remainNum * columnMinWidth + checkColumnWidth) + offset + 'px'
        } else if (pct.count === columnNum) {
          return defaultMinWidth
        } else {
          let remainNum = columnNum - abs.count - pct.count
          if (remainNum < 0 || pct.total >= 100) return defaultMinWidth

          let ret = (remainNum * columnMinWidth + checkColumnWidth + abs.total) * 100 / (100 - pct.total)
          return Math.ceil(ret) + offset + 'px'
        }
      }
    },
    updateFixedColumn () {
      if (!(typeof this.fixedConfig === 'number' && this.fixedConfig >= 0)) {
        this.fixedColumn = []
        this.fixedWidth = 0
        return
      }

      let fixedWidth = 0
      let fixedColumn = []
      for (let i = 0; i <= this.fixedConfig; i++) {
        let columnIndex = i
        let item = this.columnWidth[columnIndex]
        if (item && item.type === 'absolute') {
          fixedWidth += parseFloat(item.value)
          fixedColumn.push(columnIndex)
        } else {
          this.fixedColumn = []
          this.fixedWidth = 0
          throw new Error(`Failed to render fixed column, the width of fixed column(${i}) needs to be configured with an absolute pixel value by params.columnWidth `)
        }
      }

      let checkColumnWidth = this.showCheck ? 50 : 0
      fixedWidth += checkColumnWidth
      this.fixedWidth = fixedWidth
      this.fixedColumn.splice(0, this.fixedColumn.length, ...fixedColumn)
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
    getStyleCustomized (rowIndex, columnIndex) {
      if (!(this.styleConfig && (this.styleConfig.row || this.styleConfig.column || this.styleConfig.cell))) return {}

      if (Array.isArray(this.styleConfig.row)) {
        for (let i = 0; i < this.styleConfig.row.length; i++) {
          let item = this.styleConfig.row[i]
          if (typeof item.styles === 'object') {
            if (item.scope === 'all') { return item.styles }
            else if (Array.isArray(item.scope) && 
              (item.scope.includes(rowIndex) || item.scope.includes(rowIndex - this.sourceData.length))) {
              return item.styles
            }
          }
        }
      }
      
      if (Array.isArray(this.styleConfig.column)) {
        for (let i = 0; i < this.styleConfig.column.length; i++) {
          let item = this.styleConfig.column[i]
          if (typeof item.styles === 'object') {
            if (item.scope === 'all') { return item.styles }
            else if (Array.isArray(item.scope) && 
              (item.scope.includes(columnIndex) || item.scope.includes(columnIndex - this.sourceData[0].length))) {
              return item.styles
            }
          }
        }
      }

      if (Array.isArray(this.styleConfig.cell)) {
        for (let i = 0; i < this.styleConfig.cell.length; i++) {
          let item = this.styleConfig.cell[i]
          if (typeof item.styles === 'object') {
            if (item.scope === 'all') { return item.styles }
            else if (Array.isArray(item.scope)) {
              let included = item.scope.some(s => {
                return (Array.isArray(s) && s.length >= 2 && (s[0] === rowIndex || s[0] === (rowIndex - this.sourceData.length)) && (s[1] === columnIndex || s[1] === (columnIndex - this.sourceData[0].length)))
              })
              if (included) return item.styles
            }
          }
        }
      }

      return {}
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
   * @function 鼠标进入Row事件
   * @param {Object} tableRow Row数据对象
   * @param {Boolean} isFixedBody 是否为固定列中的row
   */
    onMouseenter (tableRow, isFixedBody = false) {
      tableRow.hovering = true
      if (isFixedBody && this.$refs.scrollbar && this.$refs.scrollbar.onMouseenter) {
        this.$refs.scrollbar.onMouseenter()
      }
    },
    /**
   * @function 鼠标离开Row事件
   * @param {Object} tableRow Row数据对象
   * @param {Boolean} isFixedBody 是否为固定列中的row
   */
    onMouseleave (tableRow, isFixedBody = false) {
      tableRow.hovering = false
      if (isFixedBody && this.$refs.scrollbar && this.$refs.scrollbar.onMouseleave) {
        this.$refs.scrollbar.onMouseleave()
      }
    },
    onContextmenuCell (event, tableCell, rowIndex, columnIndex) {
      this.$emit('cell-contextmenu', event, rowIndex, columnIndex, tableCell.data)
    },
    onMouseenterTable () {
      if (this.$refs.hscroll) {
        this.$refs.hscroll.showBar()
      }
    },
    onMouseleaveTable () {
      if (this.$refs.hscroll) {
        this.$refs.hscroll.hiddenBar()
      }
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
   * @function 双击Cell事件
   * @param {Object} tableCell Cell数据对象
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   */
    onDblclickCell (tableCell, rowIndex, columnIndex) {
      this.$emit('cell-dblclick', rowIndex, columnIndex, tableCell.data)
    },
    /**
   * @function Cell失去焦点. 如果启用了编辑功能，则用当前输入更新数据。如果源数据是number类型，则输入为number时才有效
   * @param {Object} tableCell Cell数据对象
   * @param {Number} rowIndex 行索引
   * @param {Number} columnIndex 列索引
   */
    onCellBlur (tableCell, rowIndex, columnIndex) {
      if (!this.isEditable(rowIndex, columnIndex)) return

      let cellEle = document.querySelector(`#${tableCell.key}`)
      let newVal = trim(cellEle.innerHTML)

      if (cellEle && (tableCell.data !== newVal)) {
        if (typeof tableCell.data === 'number') {
          newVal = Number(newVal)
          if (tableCell.data === newVal) return
          if (isNaN(newVal)) {
            return (cellEle.innerHTML = `${tableCell.data}`)
          }
          
          tableCell.data = newVal
          this.$emit('cell-change', rowIndex, columnIndex, tableCell.data)
        } else {
          tableCell.data = trim(cellEle.innerHTML)
          this.$emit('cell-change', rowIndex, columnIndex, tableCell.data)
        }
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

      // 默认排序规则
      let ascending = (a, b) => { 
        if (a === b) { return 0 }
        else { return a > b ? 1 : -1 }
      }
      let descending = (a, b) => { 
        if (a === b) { return 0 }
        else { return b > a ? 1 : -1 }
      }

      // 自定义排序规则
      if (this.sortConfig && this.sortConfig[index]) {
        if (typeof this.sortConfig[index].ascending === 'function') {
          ascending = this.sortConfig[index].ascending
        }
        if (typeof this.sortConfig[index].descending === 'function') {
          descending = this.sortConfig[index].descending
        }
      }
      
      this.tableData.rows.sort((row1, row2) => {
        if (row1.index === 0) return -1
        if (row2.index === 0) return 1
        let data1 = row1.cells[index].data
        let data2 = row2.cells[index].data
        if (value === 'ascending') {
          return ascending(data1, data2)
        } else {
          return descending(data1, data2)
        }
      })

      this.$emit('sort-change', index, value)
      this.updateActivatedRows()
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

      this.activatedFilter[columnIndex] = true

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

      this.updateActivatedRows()
      this.$nextTick(this.updatePagination)
    },
    /**
   * @function 清除筛选状态
   * @param {Number} columnIndex 列索引。传入列索引时，对该列清除；不传索引时，清除所有筛选
   */
    clearFilter (columnIndex) {
      if (typeof columnIndex === 'number') {
        this.activatedFilter[columnIndex] = false
        delete this.tableData.filteredRows[columnIndex]

        if (this.filterConfig && this.filterConfig[columnIndex]) {
          this.filterConfig[columnIndex].content.forEach(c => { c.checked = false })
        }
      } else {
        this.activatedFilter = {}
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
   * @param {Array} included 在指定的列里进行匹配
   * @param {Array} excluded 不在指定的列里匹配。优先级高于included
   */
    search (searchValue, included, excluded) {
      if (!(this.tableData && this.tableData.rows)) return

      searchValue = String(searchValue)
      let isIncluded = !!(included && included.length >= 1)
      let isExcluded = !!(excluded && excluded.length >= 1)

      this.tableData.rows.forEach(row => {
        if (row && row.cells) {
          if (!searchValue) {
            return row.show = true
          }

          let matched = row.cells.some((cell, index) => {
            if (isExcluded && excluded.includes(index)) return false
            if (isIncluded && !included.includes(index)) return false
            return String(cell.data).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
          })
          row.show = !!matched
        }
      })

      this.updateActivatedRows()
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

      this.updateActivatedRows()
      this.$nextTick(this.updatePagination)
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
   * @param {Boolean} excludeFiltered 是否排除被（搜索/列过滤）过滤掉的（已勾选）行。默认false
   * @param {Boolean} excludeNotInPage 在启用分页情况下，是否排除不在当前页的（已勾选）行。默认false
   */
    getCheckedRowIndexs (includeWhenHeaderInfirstRow = false, excludeFiltered = false, excludeNotInPage = false) {
      if (!this.showCheck) return []

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let indexs = []

        this.tableData.rows.forEach((row, index) => {
          if (index === 0 && this.headerInfirstRow) {
            if (!includeWhenHeaderInfirstRow) return
            if (row.checked !== false) return indexs.push(row.index)
          }

          if (row.checked) {
            if (excludeFiltered && (!row.show || row.filtered)) return
            if (excludeNotInPage && this.pagination && !row.inPage) return
            indexs.push(row.index)
          }
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
        let cellData = tableRow.cells[i].data
        if (typeof cellData === 'undefined') cellData = ''
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
   * @function 设置指定行选中状态
   * @param {Array} rows 指定的行
   * @param {Boolean} checked true/false
   */
    setRowChecked (rows, checked = true) {
      if (!(Array.isArray(rows) && rows.length > 0)) return

      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let checkedRows = 0

        this.tableData.rows.forEach((row, index) => {
          if (index === 0 && this.headerInfirstRow) return
          if (rows.includes(row.index)) {
            row.checked = !!checked
          }
          checkedRows += Number(!!row.checked)
        })

        if (this.headerInfirstRow) {
          if (checkedRows === (this.tableData.rows.length - 1)) {
            this.tableData.rows[0].checked = true
          } else if (checkedRows > 0) {
            this.tableData.rows[0].checked = 'indeterminate'
          } else {
            this.tableData.rows[0].checked = false
          }
        }
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
    },
    /**
   * @function 列的数量
   */
    getColumnNum () {
      if (this.tableData && unemptyArray(this.tableData.rows)) {
        let row = this.tableData.rows[0]
        return row.cells.length
      }
      return 0
    },
    /**
     * @function 水平方向滚动事件
     */
    onScrollX (pos) {
      if (pos.right) {
        this.scrollx = 'right'
      } else if (pos.left) {
        this.scrollx = 'left'
      } else {
        this.scrollx = 'middle'
      }
      this.headerLeft = pos.value
      if (this.bodyViewerWidth > 0) {
        this.hMovement = pos.value / this.bodyViewerWidth * 100
      } else {
        this.hMovement = 0
      }
    },
    /**
     * @function 垂直方向滚动事件
     */
    onScrollY (pos) {
      if (pos.top) {
        this.scrolly = 'top'
      } else if (pos.bottom) {
        this.scrolly = 'bottom'
      } else {
        this.scrolly = 'middle'
      }
      this.fixedTop = pos.value
    },
    onSize (size) {
      this.bodyViewerWidth = size.viewerWidth
      this.bodyWidth = size.wrapperWidth
    },
    /**
     * @function 固定列的鼠标滚动事件
     */
    onFixedScroll (e) {
      if (!(this.fixedWidth > 0)) return
      if (!(this.$refs.fixedBody && this.$refs.fixedBodyInner)) return
      if (!this.$refs.scrollbar) return

      let viewerHeight = this.$refs.fixedBodyInner.clientHeight
      let wrapperHeight = this.$refs.fixedBody.clientHeight

      setTimeout(() => {
        let scrollY = e.deltaY > 0 ? this.scrollStep : -(this.scrollStep)
        let nextY = this.fixedTop + scrollY

        if (viewerHeight > wrapperHeight) {
          this.$refs.scrollbar.scrollToY(nextY)
        }
      }, 10)
    },
    onChangePosition (movement) {
      let next = movement / 100
      this.$refs.scrollbar.scrollToX(next * this.bodyViewerWidth)
    }
  },
  components: { VueInput, FilterPanel, VuePagination, VueScrollbar, HorizontalScrollbar }
}
</script>

<style lang="scss" scoped>

$textColor: rgba(0,0,0,0.85);
$normalColor: rgba(0,0,0,0.65);
$disabledColor: rgba(0,0,0,0.25);
$borderColor: rgba(217,217,217,1);
$activeColor: #046FDB;
$fontFamily: Arial, Helvetica, sans-serif;

.v-table-dynamic{
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-family: $fontFamily;
  font-size: 13px;
  color: $textColor;
  padding-bottom: 10px;
  overflow: hidden;
}
.v-table{
  position: relative;
  box-sizing: border-box;
  border: none;
}
.v-table::before{
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  z-index: 1;
  border-bottom: 1px solid $borderColor;
}
.v-table.v-show-border{
  border-top: 1px solid $borderColor;
}
.v-table-left-line, .v-table-right-line{
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  z-index: 1;
}
.v-table-left-line{
  left: 0;
  border-left: 1px solid $borderColor;
}
.v-table-right-line{
  right: 0;
  border-right: 1px solid $borderColor;
}

.v-table-scrollbar{
  position: absolute;
  width: 100%;
  left: 0;
  bottom: -8px;
  height: 8px;
  background: transparent;
}

.v-table-header-wrap{
  display: block;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.v-table-fixed{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  box-sizing: border-box;
  z-index: 2;
  overflow: hidden;
  border-bottom: 1px solid $borderColor;
}
.v-table-fixed.is-show-shadow{
  -webkit-box-shadow: 1px 0px 6px rgba(0,0,0,.12);
  box-shadow: 1px 0px 6px rgba(0,0,0,.12);
}
.v-table-body-fixed{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.v-table-row{
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid $borderColor;
  background-color: #FFFFFF;
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
.v-table-row.is-hovering{
  background-color: #F3F5F7;
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
  height: 12px;
  width: 12px;
  font-weight: 400;
  color: $textColor;
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
  border-color: $activeColor;
}
.table-check-all{
  margin-right: 8px;
}
.table-check-all.is-checked,
.table-check-row.is-checked{
  border-color: $activeColor;
  background-color: $activeColor;
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

.table-cell-inner{
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border: none;
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
    border-bottom-color: $activeColor;
  }
  .sort-descending.activated{
    border-top-color: $activeColor;
  }
}

.table-filter{
  position: relative;
  margin-left: 2px;
  line-height: 100%;
  vertical-align: middle;
  cursor: pointer;
  color: $normalColor;
  i.iconfont{
    font-size: 12px;
  }
  i.iconfont.activated{
    color: $activeColor;
  }
}

.table-pagination{
  padding: 0px;
  padding-top: 10px;
}

</style>