<template>
  <div class="content-wrap">
    <aside>
      <!-- <vue-button class="aside-btns" size="mini" @click="addRow">Add Row</vue-button> -->
    </aside>
    <header>
      <vue-search class="tool-search" v-model="searchValue" placeholder="Search" @search="handleSearch(searchValue)">
        <i class="iconfont iconsearch" slot="suffix" @click="handleSearch(searchValue)"></i>
      </vue-search>
    </header>
    <section>
      <vue-table-dynamic 
        :params="params"
        @row-click="onRowClick"
        @cell-dblclick="onCellDblclick"
        @cell-contextmenu="onCellContextmenu"
        ref="table"
      >
        <template v-slot:column-0="{ props }">
          <span class="cell--slot">{{props.cellData.index}}</span>
        </template>
        <template v-slot:column-1="{ props }">
          <span class="cell--slot" :style="{ color: props.cellData.color }">{{props.cellData.value}}</span>
        </template>
        <template v-slot:column-3="{ props }">
          <span class="cell--slot">
            <vue-button class="aside-btns aside-btns-slot" size="mini" @click.stop="testSlot(props)">Test Slot1</vue-button>
            <vue-button class="aside-btns" type="text" size="mini" @click.stop="testSlot(props)">Test Slot2</vue-button>
          </span>
        </template>
      </vue-table-dynamic>
    </section>
    <vue-msg :timeout="2000" :top="100" :right="20" ref="vueMsg"></vue-msg>
  </div>
</template>

<script>
import VueButton from './VueButton.vue'
import VueSearch from './VueSearch.vue'
import VueMsg from 'vue-msgs'
import { saveAs } from 'file-saver'
import { table, getBorderCharacters } from 'table'
const cloneDeep = require('lodash.clonedeep')

const random = (length) => {
  if (!(length > 0 && length < 10)) length = 5
  let num = parseInt(Date.now() + Math.random() * 10000000)
  return num.toString(16).slice(0 - length)
}

const colors = ['#046FDB', '#F85252', '#8B54E4', '#F07B3B', '#3ba272']

const defaultTableParams = {
  data: [
    [' Index', `Data1`, `Data2`, `Data3`]
  ],
  header: 'row',
  height: '',
  headerHeight: 36,
  rowHeight: 36,
  border: true,
  stripe: true,
  showCheck: true,
  enableSearch: false,
  headerBgColor: '#efefef',
  columnWidth: [{column: 0, width: 80}, {column: 1, width: 150}, {column: 2, width: 150 }, {column: 3,  width: 180},],
  sharedWidth: true,
  fixed: 1,
  sort: [
    { 
      column: 0, 
      ascending: (a, b) => { return a.index - b.index }, 
      descending: (a, b) => { return b.index - a.index } 
    }
  ],
  edit: {},
  highlight: {},
  filter: [{
    column: 0, 
    content: [{text: '> 3', value: 3}, {text: '> 5', value: 5}, {text: '> 7', value: 7}], 
    method: (value, tableCell) => { return tableCell.data.index > value }
  }, {
    column: 2, 
    content: [{text: '1-Cell', value: '1-Cell'}, {text: '2-Cell', value: '2-Cell'}, {text: '3-Cell', value: '3-Cell'}], 
    method: (value, tableCell) => { return String(tableCell.data).toLocaleLowerCase().includes(String(value).toLocaleLowerCase()) }
  }],
  pagination: true,
  language: ''
}

for (let i = 0; i < 200; i++) {
  defaultTableParams.data.push([
    { index: i+1, id: `${i+1}` }, 
    { value: `${random()}-Cell`, id: `${i+1}`, color: colors[i % 5] }, 
    `${random()}-Cell`, 
    `${random()}-Cell`
  ])
}

const tableHeaderTypes = ['', 'row', 'column']

export default {
  name: 'CustomCell',
  data() {
    return {
      params: cloneDeep(defaultTableParams),
      widthIncrement: 1,
      heightIncrement: 1,
      rowHeightIncrement: 1,
      searchValue: ''
    }
  },
  methods: {
    addRow () {
      let rowNum = this.params.data.length
      let columnNum = this.params.data[0].length
       
      if (rowNum >= 200) {
        return this.showMsg('warning', 'The number of rows cannot be more than 200.')
      }

      let newRow = [rowNum]
      for (let i = 1; i < columnNum; i++) {
        newRow.push(`${random()}-Cell`)
      }

      this.params.data.push(newRow)
    },
    handleSearch (value) {
      this.$refs.table.search(
        value, 
        [0, 1, 2],
        null,
        [
          { column: 0, method: cellData => cellData.index },
          { column: 1, method: cellData => cellData.value }
        ]
      )
    },
    onRowClick (index, data) {
      console.log('[ onRowClick ] : ', index, data)
    },
    onCellDblclick (rowIndex, columnIndex, data, rowData) {
      console.log('[ onCellDblclick ]: ', rowIndex, columnIndex, data, rowData)
    },
    onCellContextmenu (rowIndex, columnIndex, data) {
      console.log('[ onCellContextmenu ]: ', rowIndex, columnIndex, data)
    },
    testSlot (slotData) {
      console.log('testSlot ', slotData)
    },
    // 消息弹框 type：success/info/warning/error
    showMsg (type, info) {
      if (this.$refs && this.$refs.vueMsg && typeof this.$refs.vueMsg.showMsg === 'function') {
        this.$refs.vueMsg.showMsg(type, info)
      }
    }
  },
  components: { VueButton, VueSearch, VueMsg }
}
</script>

<style lang="scss" scoped>
.content-wrap{
  height: 100%;
  width: 100%;
  position: relative;
  aside{
    position: absolute;
    top: 0px;
    bottom: 0;
    left: 0;
    width: 140px;
    padding: 30px;
    background-color: rgb(33,37,43);
    border-right: 1px solid rgb(33,37,43);
    overflow-y: auto;
    .aside-btns{
      display: block;
      width: 100%;
      margin-top: 12px;
      font-size: 12px;
      font-family: Arial;
    }
    .aside-line{
      display: block;
      width: calc(100% + 10px);
      margin: 12px -5px 6px -5px;
      border-bottom: 1px solid rgb(127, 130, 139);
    }
  }
  header {
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    left: 200px;
    right: 0;
    height: 50px;
    padding: 0 25px;
    display: flex;
    align-items: center;
    .tool-search {
      width: 200px;
    }
  }
  section {
    position: absolute;
    top: 50px;
    bottom: 0;
    left: 200px;
    right: 0;
    padding: 20px 25px;
    overflow-y: auto;
  }
  .downloader{
    height: 0;
    width: 0;
    visibility: hidden;
  }
}

.aside-btns-slot{
  margin-right: 10px;
}

$scrollbar-size: 6px;
*::-webkit-scrollbar {
  width: 2px;
  opacity: 0.1;
  cursor: pointer;
}
*::-webkit-scrollbar:horizontal {
  height: $scrollbar-size;
  cursor: pointer;
}
*::-webkit-scrollbar:vertical {
  width: $scrollbar-size;
  cursor: pointer;
}
*::-webkit-scrollbar-track {
  background-color: transparent;
  opacity: 0.3;
}
*{
  &:hover::-webkit-scrollbar-thumb{
    visibility: visible;
  }
}
*::-webkit-scrollbar-thumb {
  opacity: 0.1;
  background-color: rgba(0, 0, 0, .45);
  border-radius: $scrollbar-size;
  visibility: hidden;
  cursor: -webkit-grab;
  cursor: pointer;
}
*::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.65);
}
*::-webkit-scrollbar-thumb:active {
    background-color: rgba(0, 0, 0, 0.65);
}

</style>
<style>
.cell--slot{
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
}
</style>
