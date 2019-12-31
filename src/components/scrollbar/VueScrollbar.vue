<template>
  <div
    class="vue-scrollbar"
    @click="calculateSize"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    ref="scrollWrapper"
  >
    <div
      :class="['vue-scroll-view', dragging ? '' : 'scrollbar-transition']"
      ref="scrollViewer"
      @wheel="scroll"
      :style="{
        marginTop: this.top * -1 +'px',
        marginLeft: this.left * -1 +'px'
      }"
    >
      <slot></slot>
      <resize-detector @resize="onResize"></resize-detector>
    </div>
    <vertical-scrollbar
      v-if="isReady"
      :color="scrollbarColor"
      :viewer-height="viewerHeight"
      :wrapper-height="wrapperHeight"
      :scrolling="vMovement"
      @dragging="onScrollbarDragging"
      @drag-stop="onScrollbarDragStop"
      @change-position="onChangePosition"
      ref="vscroll"
    >
    </vertical-scrollbar>
  </div>
</template>

<script>
import VerticalScrollbar from './VerticalScrollbar.vue'
import ResizeDetector from './ResizeDetector.vue'

export default {
  name: 'VueScrollbar',
  data () {
    return {
      scrollWrapper: null,
      scrollViewer: null,
      isReady: false,
      top: 0,
      left: 0,
      viewerHeight: null,
      viewerWidth: null,
      wrapperHeight: null,
      wrapperWidth: null,
      vMovement: 0,
      hMovement: 0,
      dragging: false,
      allowBodyScroll: false,
    }
  },
  props: {
    step: { type: Number, default: 50 },
    scrollbarColor: { type: String, default: '#DFDFDF' },
    onMaxScroll: Function,
  },
  mounted () {
    this.scrollWrapper = this.$refs.scrollWrapper
    this.scrollViewer = this.$refs.scrollViewer
    this.calculateSize()
    window.addEventListener('resize', this.calculateSize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.calculateSize)
    this.scrollWrapper = null
    this.scrollViewer = null
  },
  methods: {
    // 鼠标滚轮滚动
    scroll (e) {
      this.calculateSize(() => {
        let step = this.step

        let shifted = e.shiftKey
        let scrollY = e.deltaY > 0 ? step : -(step)
        let scrollX = e.deltaX > 0 ? step : -(step)
        if(shifted && e.deltaX == 0) scrollX = e.deltaY > 0 ? step : -(step)

        let nextY = this.top + scrollY
        let nextX = this.left + scrollX
        let canScrollY = this.viewerHeight > this.wrapperHeight
        let canScrollX = this.viewerWidth > this.wrapperWidth

        this.allowBodyScroll = true
        if (canScrollY && !shifted) this.normalizeVertical(nextY)
        if (shifted && canScrollX) this.normalizeHorizontal(nextX)

        if (!this.allowBodyScroll) {
          e.preventDefault()
          e.stopPropagation()
        }
      })
    },
    onResize () {
      this.calculateSize(() => {
        let canScrollY = this.viewerHeight > this.wrapperHeight
        let canScrollX = this.viewerWidth > this.wrapperWidth
        
        canScrollY ? this.normalizeVertical(this.top) : this.top = 0
        canScrollX ? this.normalizeHorizontal(this.left) : this.left = 0
      })
    },
    // 鼠标移入滚动区
    onMouseenter () {
      if (this.$refs.vscroll) {
        this.calculateSize(() => {
          this.$refs.vscroll.showBar()
        })
      }
    },
    // 鼠标移出滚动区
    onMouseleave () {
      if (this.$refs.vscroll) {
        this.$refs.vscroll.hiddenBar()
      }
    },
    scrollToY (y) {
      this.normalizeVertical(y)
    },
    scrollToX (x) {
      this.normalizeHorizontal(x)
    },
    normalizeVertical (next) {
      const size = this.getSize()
      const outOfViewHeight = size.viewerHeight - size.wrapperHeight

      const maxBottom = next > outOfViewHeight
      if (maxBottom) next = outOfViewHeight
      const maxTop = next < 0
      if (maxTop) next = 0

      const shouldScroll = this.top !== next
      this.allowBodyScroll = !shouldScroll
      if (shouldScroll) {
        this.top = next
        this.vMovement = next / size.viewerHeight * 100

        if (this.onMaxScroll && (maxTop || maxBottom)) {
          this.onMaxScroll({ top: maxTop, bottom: maxBottom, right: false, left: false })
        }
      }
    },
    normalizeHorizontal (next) {
      const size = this.getSize()
      const outOfViewWidth = size.viewerWidth - this.wrapperWidth

      const maxRight = next > outOfViewWidth
      if(maxRight) next = outOfViewWidth
      const maxLeft = next < 0
      if(next < 0) next = 0

      const shouldScroll = this.left !== next
      this.allowBodyScroll = !shouldScroll
      if (shouldScroll) {
        this.left = next,
        this.hMovement = next / size.viewerWidth * 100

        if (this.onMaxScroll && (maxRight || maxLeft)) {
          this.onMaxScroll({ right: maxRight, left: maxLeft, top: false, bottom: false })
        }
      }
    },
    // 滚动条位置改变。movement：改变后的位置百分比。orientation：方向
    // 根据新的位置百分比，计算viewer视图的偏移量（marginTop/marginLeft）
    onChangePosition (movement, orientation) {
      this.calculateSize(() => {
        let next = movement / 100
        if (orientation === 'vertical') this.normalizeVertical(next * this.viewerHeight)
        if (orientation === 'horizontal') this.normalizeHorizontal(next * this.viewerWidth)
      })
    },
    // 滚动条正在拖拽
    onScrollbarDragging () {
      this.dragging = true
    },
    // 滚动条停止拖拽
    onScrollbarDragStop () {
      this.dragging = false
    },
    // 获取wrapper和viewer的高度/宽度
    getSize () {
      return {
        viewerHeight: this.scrollViewer.clientHeight,
        viewerWidth: this.scrollViewer.clientWidth,
        wrapperHeight: this.scrollWrapper.clientHeight,
        wrapperWidth: this.scrollWrapper.clientWidth
      }
    },
    // 计算wrapper和viewer的高度/宽度，刷新缓存值。
    calculateSize (cb) {
      if(typeof cb !== 'function') cb = null

      let size = this.getSize()
      if(size.wrapperHeight !== this.wrapperHeight ||
        size.wrapperWidth !== this.wrapperWidth ||
        size.viewerHeight !== this.viewerHeight ||
        size.viewerWidth !== this.viewerWidth ) {

        this.viewerHeight = size.viewerHeight
        this.viewerWidth = size.viewerWidth
        this.wrapperHeight = size.wrapperHeight
        this.wrapperWidth = size.wrapperWidth

        this.isReady = true
        return cb ? cb() : false
      }
      return cb ? cb() : false
    }
  },
  components: { VerticalScrollbar, ResizeDetector } 
}
</script>

<style scoped>
.vue-scrollbar{
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.vue-scroll-view{
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  min-width: 100%;
  width: 100%;
}
</style>