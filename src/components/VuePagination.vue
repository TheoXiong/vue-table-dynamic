<template>
  <div class="vue-pagination flex-c-e" v-if="!disabled">
    <div 
      v-if="pageSizes && pageSizes.length > 0" 
      class="pagination-size flex-c-b"
      @click="showPageSizeOptions = !showPageSizeOptions"
      ref="pSize"
    >
      <span class="size-text">{{ size }}/page</span>
      <span class="size-icon">
        <i class="iconfont icondown"></i>
      </span>
      <transition name="zoom-in-top">
        <div class="size-options" v-show="showPageSizeOptions">
          <div 
            v-for="(item, index) in pageSizes" 
            :key="index" 
            class="size-item flex-c"
            @click.stop="onSelect(index)"
          >
            {{ item }}/page
          </div>
        </div>
      </transition>
    </div>
    <div v-if="total > 0" class="pagination-page flex-c">
      <span 
        class="page-item page-forward flex-c-c" 
        :class="{ 'is-disabled': disableForward }"
        @click="onForward"
      >
        <i class="iconfont iconleft"></i>
      </span>
      <span 
        v-for="(page, index) in pages" 
        :key="index" 
        class="page-item flex-c-c"
        :class="{
          'is-disabled': page.disabled,
          'is-activated': page.activated && !page.disabled
        }"
        @click="onPage(page)"
      >
        {{ page.value }}
      </span>
      <span 
        class="page-item page-next flex-c-c" 
        :class="{ 'is-disabled': disableNext }"
        @click="onNext"
      >
        <i class="iconfont iconright"></i>
      </span>
    </div>
  </div>
</template>

<script>
import ClickOutside from '../utils/clickoutside.js'

const pageCountMax = 9

export default {
  name: 'VuePagination',
  data() {
    return {
      clickOutside: null,
      pages: [],
      size: 10, // 每页显示数量
      showPageSizeOptions: false,
      pageCount: 1, // 页数
      currentPage: 1 // 当前页编号
    }
  },
  props: {
    total: Number,
    pageSize: Number,
    pageSizes: { type: Array, default: () => [10, 20, 50, 100]},
    disabled: { type: Boolean, default: false }
  },
  computed: {
    disableForward () {
      return this.currentPage === 1
    },
    disableNext () {
      return this.currentPage === this.pageCount
    }
  },
  watch: {
    total: {
      handler (v) {
        if (v > 0 && this.size > 0) {
          this.$nextTick(() => { this.initPages(v) })
        }
      },
      immediate: true
    },
    pageSize: {
      handler (v) {
        if (v > 0 && this.size !== v) {
          this.size = v
          this.total > 0 ? this.$nextTick(() => { this.initPages(this.total) }) : ''
        }
      },
      immediate: true
    },
    pageSizes: {
      handler (v) {
        if (v && v.length > 0 && this.size !== this.pageSize) {
          this.size = v[0]
        }
        this.showPageSizeOptions = false
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    let selfEle = this.$refs.pSize
    if (selfEle) {
      this.clickOutside = new ClickOutside([selfEle], document, () => { this.showPageSizeOptions = false })
      this.clickOutside.bind()
    }
  },
  beforeDestroy () {
    if (this.clickOutside && this.clickOutside.unbind) {
      this.clickOutside.unbind()
    }
  },
  methods: {
    initPages (total) {
      if (!(total > 0)) return
      this.pageCount = Math.ceil(total / this.size)
      this.toPage(1)
    },
    onPage (page) {
      if (page.disabled || page.activated) return
      this.toPage(page.number)
    },
    onForward () {
      if (this.disableForward) return
      this.toPage(this.currentPage - 1)
    },
    onNext () {
      if (this.disableNext) return
      this.toPage(this.currentPage + 1)
    },
    /**
     *  page数小于pageCountMax时，全部显示
     *  page数大于pageCountMax时，page视图分三种，[ 1 ---> thresholdLeft ---> thresholdRight ---> pageCount ]
     *  根据当前激活page编号，显示对应视图
     *  第一种 [1, thresholdLeft]: 1到pageCountMax-2依次显示page最前面编号, pageCountMax-1显示..., pageCountMax显示pageCount
     *  第二种 (thresholdLeft, thresholdRight): 1...pages...pageCount
     *  第三种 [thresholdRight, pageCount]: 1显示page1, 2显示..., 3到pageCountMax依次显示page最后面编号
     */
    toPage (tagetPage) {
      if (this.disabled) return
      if (tagetPage < 1 || tagetPage > this.pageCount) return

      if (this.pageCount <= pageCountMax) {
        this.pages.splice(0, this.pages.length)
        for (let i = 1; i < (this.pageCount + 1); i++) {
          this.pages.push({ number: i, value: String(i), disabled: false, activated: !!(tagetPage === i) })
        }
        this.currentPage = tagetPage
        this.notifyPageChanged(this.currentPage)
        return
      }

      const thresholdLeft = Math.floor(pageCountMax / 2)
      const thresholdRight = this.pageCount - thresholdLeft + 1
      let pages = []

      if (tagetPage <= thresholdLeft) {
        for (let i = 1; i < (pageCountMax + 1); i++) {
          pages.push({ number: i, value: String(i), disabled: false, activated: !!(tagetPage === i) })
        }
        pages[pages.length - 2] = { number: this.pageCount - 1, value: '...', disabled: true, activated: false }
        pages[pages.length - 1].value = String(this.pageCount)
        pages[pages.length - 1].number = this.pageCount
      } else if (tagetPage >= thresholdRight) {
        for (let i = (this.pageCount - pageCountMax + 1); i < (this.pageCount + 1); i++) {
          pages.push({ number: i, value: String(i), disabled: false, activated: !!(tagetPage === i) })
        }
        pages[0].value = '1'
        pages[0].number = 1
        pages[1] = { number: 2, value: '...', disabled: true, activated: false }
      } else {
        for (let i = 0; i < pageCountMax; i++) {
          let number = tagetPage - Math.floor(pageCountMax / 2) + i
          pages.push({ 
            number: number, 
            value: String(number), 
            disabled: false, 
            activated: !!(tagetPage === number)
          })
        }
        pages[0] = { number: 1, value: '1', disabled: false, activated: false }
        pages[1] = { number: 2, value: '...', disabled: true, activated: false }
        pages[pages.length - 2] = { number: this.pageCount - 1, value: '...', disabled: true, activated: false }
        pages[pages.length - 1] = { number: this.pageCount, value: String(this.pageCount), disabled: false, activated: false }
      }

      this.currentPage = tagetPage
      this.pages.splice(0, this.pages.length)
      this.pages.push(...pages)
      this.notifyPageChanged(this.currentPage)
    },
    notifyPageChanged (currentPage) {
      this.$nextTick(() => {
        this.$emit('current-page', currentPage)
      })
    },
    onSelect (index) {
      if (this.pageSizes && (this.pageSizes.length > index) && (this.size !== this.pageSizes[index])) {
        this.size = this.pageSizes[index]
        this.$emit('size', this.size)
        this.$nextTick(() => { this.initPages(this.total) })
      }
      this.showPageSizeOptions = false
    }
  }
}
</script>

<style lang="scss" scoped>
$borderColor: #DCDFE6;

.pagination-size{
  position: relative;
  box-sizing: border-box;
  height: 22px;
  min-width: 80px;
  padding: 0 6px;
  margin-right: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  outline: 0;
  border: 1px solid $borderColor;
  cursor: pointer;
  i.iconfont{
    font-size: 12px;
    height: 12px;
    width: 12px;
    font-weight: 500;
  }
  .size-icon{
    height: 12px;
    width: 12px;
  }
  .size-text{
    margin-right: 16px;
  }
  .size-options{
    position: absolute;
    box-sizing: border-box;
    padding: 4px 0px;
    outline: 0;
    z-index: 9999;
    top: 100%;
    left: -1px;
    right: -1px;
    border: 1px solid #E5EEF5;
    box-shadow: 0px 2px 12px 0 rgba(0,0,0,0.1);
    overflow: hidden;
    cursor: auto;
    .size-item{
      outline: 0;
      padding: 4px 6px;
      cursor: pointer;
      overflow: hidden;
    }
    .size-item:hover{
      background-color: #F1F3F5;
    }
  }
}

.page-item{
  box-sizing: border-box;
  height: 22px;
  width: 22px;
  font-size: 12px;
  color: #606266;
  border: 1px solid $borderColor;
  border-right: none;
  outline: 0;
  cursor: pointer;
  i.iconfont{
    font-size: 12px;
    height: 12px;
    width: 12px;
    font-weight: 500;
  }
}

.page-item, .pagination-size{
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none;
}

.page-item.page-forward{
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;
}
.page-item.page-next{
  border-right: 1px solid $borderColor;
  border-bottom-right-radius: 2px;
  border-top-right-radius: 2px;
}

.page-item:hover{
  background-color: #F1F3F5;
}

.page-item.is-activated{
  color: #FFFFFF;
  border-color: #409EFF;
  background-color: #409EFF;
}

.page-item.is-disabled,
.page-item.is-disabled:hover,
.page-item.is-disabled:focus,
.page-item.is-disabled:active{
  cursor:not-allowed;
  background-color: #f5f5f5;
  outline: 0;
}

.zoom-in-top-enter-active,
.zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  -webkit-transform: scaleY(1);
  -moz-transform: scaleY(1);
  -ms-transform: scaleY(1);
  -o-transform: scaleY(1);
  transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
  -webkit-transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
  -moz-transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
  -o-transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
  transform-origin: center top;
  -webkit-transform-origin: center top;
  -moz-transform-origin: center top;
  -o-transform-origin: center top;
  -ms-transform-origin: center top;
}
.zoom-in-top-enter,
.zoom-in-top-leave-active {
  opacity: 0;
  transform: scaleY(0);
  -webkit-transform: scaleY(0);
  -moz-transform: scaleY(0);
  -ms-transform: scaleY(0);
  -o-transform: scaleY(0);
}
</style>