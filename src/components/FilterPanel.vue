<template>
  <div class="filter-panel-wrap" @click.stop.prevent="">
    <transition 
      name="zoom-in-top" 
      @enter="handleEnter"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div 
        v-show="isShow.value" 
        class="filter-content"
        :style="{ top: y, left: x }"
        ref="content"
      >
        <div class="filter-body">
          <div v-for="(item, index) in filters" :key="index" class="filter-item flex-c">
            <div 
              class="filter-check flex-c-c"
              :class="{ 'is-checked': item.checked }"
              @click.stop="item.checked = !item.checked"
            >
              <i class="iconfont iconcheck" v-show="item.checked"></i>
            </div>
            <span class="filter-text">{{ item.text }}</span>
          </div>
        </div>
        <div class="filter-footer flex-c-b">
          <span class="filter-btns do-filter" @click="doFilter" :class="{ 'is-diabled': !filterable }">Filter</span>
          <span class="filter-btns" @click="doReset">Reset</span>
        </div>
      </div>
    </transition>
    <slot name="reference"></slot>
  </div>
</template>

<script>
import Display from '../utils/display.js'

export default {
  name: 'FilterPanel',
  data() {
    return {
      isShow: { value: false },
      opacity: 0,
      x: '0px',
      y: '0px',
      display: null,
      emitEle: null,
      activeEle: null,
      filters: [],
      filterable: false,
      checkedCache: []
    }
  },
  props: {
    disabled: { type: Boolean,default: false },
    content: { type: Array, default: () => [] }
  },
  watch: {
    disabled (value) {
      value ? '' : this.init()
    },
    content: {
      handler (value) {
        if (!Array.isArray(value)) return

        this.checkedCache = []
        this.filters.splice(0, this.filters.length)
        for (let i = 0; i < value.length; i++) {
          let item = value[i]
          if (item && typeof item.text === 'string' && typeof item.value !== 'undefined') {
            this.filters.push(item)
          }
        }
      },
      deep: true,
      immediate: true
    },
    filters: {
      handler (f) {
        this.filterable = f.some(i => { return i.checked })
      },
      immediate: true,
      deep: true
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.emitEle = null
    this.activeEle = null
    this.filters = []
    this.checkedCache = []

    if (this.display && this.display.unBind) {
      this.display.unBind()
      setTimeout(() => {
        this.display.clear()
        this.display = null
      }, 10)
    }
  },
  methods: {
    init () {
      setTimeout(() => {
        if (this.display || this.disabled) return

        let emitEle = this.emitEle = this.$slots.reference[0].elm
        let activeEle = this.activeEle = this.$refs.content
        this.display = new Display('click-click', this.isShow, activeEle, emitEle, document)
        this.display.doBind()
      }, 100)
    },
    getContextCoordinate (activeX, activeY) {
      let coord = [activeX + 6, activeY + 6]
      if (!(this.activeEle && this.activeEle.offsetHeight && this.activeEle.offsetWidth)) return coord
      let viewportHeight = window.innerHeight
      let viewportWidth = window.innerWidth
      let targetHeight = this.activeEle.offsetHeight
      let targetWidth = this.activeEle.offsetWidth
      
      if ((targetWidth + activeX + 8) > viewportWidth) {
        coord[0] = viewportWidth - targetWidth - 6
        coord[0] < 0 ? coord[0] = 0 : ''
      }
      if ((targetHeight + activeY + 8) > viewportHeight) {
        coord[1] = viewportHeight - targetHeight - 6
        coord[1] < 0 ? coord[1] = 0 : ''
      }
      return coord
    },
    handleEnter () {
      let coord = this.getContextCoordinate(this.display.activeX, this.display.activeY)
      this.x = coord[0] + 'px'
      this.y = coord[1] + 'px'
    },
    handleAfterEnter () {
      this.$emit('after-enter')
    },
    handleAfterLeave () {
      this.$emit('after-leave')
    },
    doFilter () {
      if (!this.filterable) return

      this.checked = this.filters.filter(f => { return f.checked })
      this.$emit('filter', this.checked)
      this.isShow.value = false
    },
    doReset () {
      this.filters.forEach(f => { f.checked = false })
      this.$emit('reset', '')
      this.isShow.value = false
    }
  }
}
</script>

<style lang="scss" scoped>
$textColor: rgba(0,0,0,0.85);
$normalColor: rgba(0,0,0,0.65);
$disabledColor: rgba(0,0,0,0.25);
$borderColor: rgba(217,217,217,1);
$activeColor: #046FDB;
$fontFamily: Arial, Helvetica, sans-serif;

.filter-content{
  position: fixed;
  z-index: 9999;
  padding: 10px;
  background-color: #FFFFFF;
  border: 1px solid $borderColor;
  border-radius: 2px;
  box-shadow: 0px 2px 12px 0 rgba(0,0,0,0.1);
  box-sizing: border-box;
  min-width: 120px;
  max-width: 300px;
  cursor: auto;
}

.filter-body{
  padding-bottom: 10px;
  .filter-item {
    padding: 4px 0px;
    .filter-text{
      margin-left: 6px;
      color: $textColor;
      font-size: 12px;
      font-weight: 500;
      overflow: hidden;
      word-wrap: normal;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.filter-check{
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
.filter-check:hover{
  border-color: $activeColor;
}
.filter-check.is-checked{
  border-color: $activeColor;
  background-color: $activeColor;
  color: #FFFFFF;
}

.filter-footer{
  padding-top: 10px;
  color: $textColor;
  font-size: 12px;
  border-top: 1px solid $borderColor;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none;
  .filter-btns{
    cursor: pointer;
  }
  .filter-btns:hover{
    color: $activeColor;
  }
}

.do-filter.is-diabled,
.do-filter.is-diabled:hover,
.do-filter.is-diabled:focus,
.do-filter.is-diabled:active{
  cursor:not-allowed;
  color: $disabledColor;
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