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
      <vue-button class="aside-btns" size="mini" @click="reset">Reset</vue-button>
    </aside>
    <section>
      <vuescroll :ops="scrollBarOpts" ref="vuescroll">
        <vue-table-dynamic 
          :params="params"
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
const cloneDeep = require('lodash.clonedeep')

const random = (length) => {
  if (!(length > 0 && length < 10)) length = 5
  let num = parseInt(Date.now() + Math.random() * 10000000)
  return num.toString(16).slice(0 - length)
}

const defaultTableParams = {
  data: [
    [`Cell-${random()}`, `Cell-${random()}`, `Cell-${random()}`],
    [`Cell-${random()}`, `Cell-${random()}`, `Cell-${random()}`],
    [`Cell-${random()}`, `Cell-${random()}`, `Cell-${random()}`]
  ],
  header: 'row',
  border: true,
  showCheck: true,
  enableUpload: true,
  enableDownload: true,
  enableSearch: true,
  columnWidth: []
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
      }
    }
  },
  methods: {
    addRow () {
      let rowNum = this.params.data.length
      let columnNum = this.params.data[0].length
       
      if (rowNum >= 30) {
        return this.showMsg('warning', 'The number of rows cannot be more than 30.')
      }

      let newRow = []
      for (let i = 0; i < columnNum; i++) {
        newRow.push(`Cell-${random()}`)
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

      for (let i = 0; i < rowNum; i++) {
        this.params.data[i].push(`Cell-${random()}`)
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
    reset () {
      this.params = cloneDeep(defaultTableParams)
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
}


</style>