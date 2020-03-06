<template>
  <div>
    <div
      v-if="width < 100"
      class="vue-scrollbar-horizontal"
      :style="{ 
        opacity: opacity,
        height: scrollbarSize + 'px',
        bottom: scrollbarOffset + 'px'
      }"
      ref="container"
      @click="onClick"
    >
      <div
        :class="['scrollbar-inner', dragging ? '' : 'scrollbar-transition']"      
        :style="{
          width: this.width+'%',
          left: this.scrolling + '%',
          backgroundColor: color,
          height: scrollbarSize + 'px',
          borderRadius: scrollbarBorderRadius + 'px'
        }"
        @mousedown="startDrag"
        ref="scrollbar"
      >
      </div>
    </div>
  </div>
</template>

<script>
const throttle = require('lodash.throttle')
const DISPLAY_LIST = ['hover', 'show', 'hidden']

export default {
  name: 'HorizontalScrollbar',
  data() {
    return {
      width: 0,
      opacity: 0,
      dragging: false,
      start: 0
    }
  },
  props: {
    scrolling: Number, //视图水平方向滚动的百分比
    wrapperWidth: Number, // 包装层（可视区）宽度
    viewerWidth: Number, // 视图宽度
    color: { type: String, default: '#DFDFDF' },
    xBarDisplay: { type: String, default: 'hover' },
    size: { type: Number, default: 6 },
    borderRadius: { type: Number, default: 4 },
    offset: { type: Number, default: 0 }
  },
  watch: {
    wrapperWidth (val, old) {
      this.calculateSize(this)
    },
    viewerWidth (val, old) {
      this.calculateSize(this)
    }
  },
  mounted () {
    this.calculateSize(this)

    // mousedown + mousemove + mouseup 实现滚动条拖动效果
    // mousemove和mouseup绑定到document，鼠标移到滚动条外部时，仍能拖动
    document.addEventListener("mousemove", this.onDrag)
    document.addEventListener("mouseup", this.stopDrag)

    this.opacity = 0
    if (this.display === 'show') this.opacity = 1

    this.handleDrag = throttle((e) => {
      if (this.dragging) {
        this.$emit('dragging')
        e.preventDefault()
        e.stopPropagation()

        let xMovement = e.clientX - this.start
        let xMovementPercentage = xMovement / this.wrapperWidth * 100;
        this.start = e.clientX

        let next = this.scrolling + xMovementPercentage
        this.$emit('change-position', next, 'horizontal')
      }
    }, 100)
  },
  beforeDestroy () {
    document.removeEventListener("mousemove", this.onDrag)
    document.removeEventListener("mouseup", this.stopDrag)
    this.handleDrag = null
  },
  computed: {
    scrollbarSize () {
      if (typeof this.size === 'number' && this.size >= 0) {
        return this.size
      }
      return 6
    },
    scrollbarBorderRadius () {
      if (typeof this.borderRadius === 'number' && this.borderRadius >= 0) {
        return this.borderRadius
      }
      return 4
    },
    scrollbarOffset () {
      if (typeof this.offset === 'number' && this.offset >= 0) {
        return this.offset
      }
      return 0
    },
    display () {
      if (DISPLAY_LIST.includes(this.xBarDisplay)) {
        return this.xBarDisplay
      }
      return 'hover'
    }
  },
  methods: {
    // 鼠标按下 => 开始拖动
    startDrag (e) {
      e.preventDefault()
      e.stopPropagation()

      if (this.display === 'hidden') return this.dragging = false

      this.dragging = true
      this.start = e.clientX
    },
    // 鼠标移动 => 拖动进行中
    // 根据鼠标在s水平方向移动距离计算新的滚动位置next（百分比），父组件根据next调整视图的marginLeft，并更新scrolling值，反馈到滚动条的位移上
    onDrag(e) {
      if (this.handleDrag) {
        this.handleDrag(e)
      }
    },
    // 鼠标松开 => 停止拖动
    stopDrag(e){
      if(this.dragging){
        this.$emit('drag-stop')
        this.dragging = false
      }
    },
    // 点击滚动槽，快速滚动到指定位置
    onClick (e) {
      if (e.target === this.$refs.container) {
        let position = this.$refs.scrollbar.getBoundingClientRect()

        let xMovement = e.clientX - position.left
        let centerize = (this.width / 2)
        let xMovementPercentage = xMovement / this.wrapperWidth * 100 - centerize

        this.start = e.clientX

        let next = this.scrolling + xMovementPercentage
        this.$emit('change-position', next, 'horizontal')
      }
    },
    // 计算滚动条宽度(百分比)
    calculateSize(source){
      this.width = source.wrapperWidth / source.viewerWidth * 100
    },
    showBar () {
      if (this.display !== 'hover') return
      this.opacity = 1
    },
    hiddenBar () {
      if (this.display !== 'hover') return
      this.opacity = 0
    }
  }
}
</script>

<style scoped>
.vue-scrollbar-horizontal{
  position: absolute;
  width: 100%;
  left: 0;
  background: transparent;
}
.vue-scrollbar-horizontal .scrollbar-inner{
  position: relative;
  cursor: default;
  opacity: 0.8;
}
</style>