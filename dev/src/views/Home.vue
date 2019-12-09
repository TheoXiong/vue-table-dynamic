<template>
  <div class="home">
    <header>
      <nav-menu></nav-menu>
    </header>
    <aside>
      <vue-button class="aside-btns" size="mini" @click="addRow">Add Row</vue-button>
      <vue-button class="aside-btns" size="mini" @click="deleteRow">Delete Row</vue-button>
      <vue-button class="aside-btns" size="mini" @click="addColumn">Add Column</vue-button>
      <vue-button class="aside-btns" size="mini" @click="deleteColumn">Delete Column</vue-button>
      <div class="aside-line"></div>
      <vue-button class="aside-btns" size="mini" @click="toggleHeader">Toggle Header</vue-button>
      <vue-button class="aside-btns" size="mini" @click="toggleBorder">Toggle Border</vue-button>
      <vue-button class="aside-btns" size="mini" @click="toggleSelect">Toggle Select</vue-button>
      <vue-button class="aside-btns" size="mini" @click="toggleSearch">Toggle Search</vue-button>
      <vue-button class="aside-btns" size="mini" @click="toggleUpload">Toggle Upload</vue-button>
      <vue-button class="aside-btns" size="mini" @click="toggleDownload">Toggle Download</vue-button>
      <div class="aside-line"></div>
      <vue-button class="aside-btns" size="mini" @click="changeColumnWidth">Change Column Width</vue-button>
    </aside>
    <section>
      <vuescroll :ops="scrollBarOpts" ref="vuescroll">
        <vue-table-dynamic 
          :params="params"
          @select="onSelect"
          @select-all="onSelectAll"
          @selection-change="onSelectionChange"
          @row-click="onRowClick"
          @cell-click="onCellClick"
          @upload="onUpload"
          @download="onDownload"
        >
        </vue-table-dynamic>
      </vuescroll>
    </section>
    <vue-msg :timeout="2000" :top="100" :right="20" ref="vueMsg"></vue-msg>
  </div>
</template>

<script>
import NavMenu from './NavMenu.vue'
import VueButton from './VueButton.vue'
import VueMsg from 'vue-msgs'
import vuescroll from 'vuescroll'
import { saveAs } from 'file-saver'
import { table, getBorderCharacters } from 'table'
const cloneDeep = require('lodash.clonedeep')

const random = (length) => {
  if (!(length > 0 && length < 10)) length = 5
  let num = parseInt(Date.now() + Math.random() * 10000000)
  return num.toString(16).slice(0 - length)
}

const defaultTableParams = {
  data: [
    ['Index', `Data1`, `Data2`, `Data3`],
    [1, `${random()}-Cell`, `${random()}-Cell`, `${random()}-Cell`],
    [2, `${random()}-Cell`, `${random()}-Cell`, `${random()}-Cell`],
    [3, `${random()}-Cell`, `${random()}-Cell`, `${random()}-Cell`]
  ],
  header: 'row',
  border: true,
  showCheck: true,
  enableUpload: true,
  enableDownload: true,
  enableSearch: true,
  columnWidth: [{column: 0, width: 80}],
  sort: [0, 1]
}

const tableHeaderTypes = ['', 'row', 'column']

export default {
  name: 'Home',
  data() {
    return {
      params: cloneDeep(defaultTableParams),
      scrollBarOpts: {
        scrollPanel: { scrollingX: false },
        bar: { background: '#DFDFDF', opacity: 0.8 }
      },
      widthIncrement: 1
    }
  },
  methods: {
    addRow () {
      let rowNum = this.params.data.length
      let columnNum = this.params.data[0].length
       
      if (rowNum >= 30) {
        return this.showMsg('warning', 'The number of rows cannot be more than 30.')
      }

      let newRow = [rowNum]
      for (let i = 1; i < columnNum; i++) {
        newRow.push(`${random()}-Cell`)
      }

      this.params.data.push(newRow)
    },
    deleteRow () {
      let rowNum = this.params.data.length

      if (rowNum <= 1) {
        return this.showMsg('warning', 'The number of rows cannot be less than 1.')
      }

      this.params.data.pop()
    },
    addColumn () {
      let rowNum = this.params.data.length
      let columnNum = this.params.data[0].length

      if (columnNum >= 12) {
        return this.showMsg('warning', 'The number of columns cannot be more than 12.')
      }

      this.params.data[0].push(`Data${columnNum}`)
      for (let i = 1; i < rowNum; i++) {
        this.params.data[i].push(`${random()}-Cell`)
      }
    },
    deleteColumn () {
      let rowNum = this.params.data.length
      let columnNum = this.params.data[0].length

      if (columnNum <= 1) {
        return this.showMsg('warning', 'The number of columns cannot be less than 1.')
      }

      for (let i = 0; i < rowNum; i++) {
        this.params.data[i].pop()
      }
    },
    toggleHeader () {
      let curr = tableHeaderTypes.indexOf(this.params.header)
      if (curr < 0 || curr === (tableHeaderTypes.length - 1)) return this.params.header = tableHeaderTypes[0]

      this.params.header = tableHeaderTypes[curr + 1]
    },
    toggleBorder () {
      this.params.border = !this.params.border
    },
    toggleSelect () {
      this.params.showCheck = !this.params.showCheck
    },
    toggleSearch () {
      this.params.enableSearch = !this.params.enableSearch
    },
    toggleUpload () {
      this.params.enableUpload = !this.params.enableUpload
    },
    toggleDownload () {
      this.params.enableDownload = !this.params.enableDownload
    },
    changeColumnWidth () {
      if (this.params.columnWidth[0].width >= 200) {
        this.widthIncrement = -1
      } else if (this.params.columnWidth[0].width <= 50) {
        this.widthIncrement = 1
      }
      this.params.columnWidth[0].width += 10 * this.widthIncrement
    },
    reset () {
      this.params = cloneDeep(defaultTableParams)
    },
    onSelect (checked, index, data) {
      console.log('onSelect: ', checked, index, data)
    },
    onSelectAll (isCheckedAll) {
      console.log('onSelectAll: ', isCheckedAll)
    },
    onSelectionChange (checkedDatas, checkedIndexs, checkedNum) {
      console.log('onSelectionChange: ', checkedDatas, checkedIndexs, checkedNum)
    },
    onRowClick (index, data) {
      console.log('onRowClick: ', index, data)
    },
    onCellClick (rowIndex, cellIndex, data) {
      console.log('onCellClick: ', rowIndex, cellIndex, data)
    },
    onUpload (datas) {
      console.log('onUpload: ', datas)
      if (!(datas && datas.length > 0)) {
        return this.showMsg('warning', 'The data is empty.')
      }
    },
    onDownload (datas) {
      if (!(datas && datas.length > 0)) {
        return this.showMsg('warning', 'The data is empty.')
      }

      let output = table(datas, { 
        border: getBorderCharacters(`void`),
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 2
        },
        drawHorizontalLine: () => { return false }
      })

      let blob = new Blob([output], {type: "application/octet-stream"})
      saveAs(blob, "table")
    },
    // 消息弹框 type：success/info/warning/error
    showMsg (type, info) {
      if (this.$refs && this.$refs.vueMsg && typeof this.$refs.vueMsg.showMsg === 'function') {
        this.$refs.vueMsg.showMsg(type, info)
      }
    }
  },
  components: { NavMenu, VueButton, VueMsg, vuescroll }
}
</script>

<style lang="scss" scoped>
.home{
  height: 100%;
  width: 100%;
  min-width: 1000px;
  position: relative;
  header {
    width: 100%;
    height: 70px;
  }
  aside{
    position: absolute;
    top: 70px;
    bottom: 0;
    left: 0;
    width: 140px;
    padding: 30px;
    background-color: rgb(33,37,43);
    border-right: 1px solid rgb(33,37,43);
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
  section {
    position: absolute;
    top:70px;
    bottom: 0;
    left: 200px;
    right: 0;
    padding: 20px 25px;
  }
  .downloader{
    height: 0;
    width: 0;
    visibility: hidden;
  }
}


</style>