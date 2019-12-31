<template>
  <div>
    <div
      v-if="height < 100"
      class="vue-scrollbar-vertical"
      :style="{ opacity: opacity }"
      @click="onClick"
      ref="container"
    >
      <div
        :class="['scrollbar-inner', dragging ? '' : 'scrollbar-transition']"
        :style="{ 
          height: height + '%', 
          top: scrolling + '%',
          backgroundColor: color
        }"
        @mousedown="startDrag"
        ref="scrollbar"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerticalScrollbar',
  data () {
    return  {
      height: 0,
      opacity: 0,
      dragging: false,
      start: 0
    }
  },
  props: {
    scrolling: Number, //视图垂直方向滚动的百分比
    wrapperHeight: Number, // 包装层（可视区）高度
    viewerHeight: Number, // 视图高度
    color: { type: String, default: '#DFDFDF' }
  },
  watch: {
    wrapperHeight (val, old) {
      this.calculateSize(this)
    },
    viewerHeight (val, old) {
      this.calculateSize(this)
    }
  },
  mounted() {
    this.calculateSize(this)

    // mousedown + mousemove + mouseup 实现滚动条拖动效果
    // mousemove和mouseup绑定到document，鼠标移到滚动条外部时，仍能拖动
    document.addEventListener("mousemove", this.onDrag)
    document.addEventListener("mouseup", this.stopDrag)
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", this.onDrag)
    document.removeEventListener("mouseup", this.stopDrag)
  },
  methods: {
    // 鼠标按下 => 开始拖动
    startDrag (e){
      e.preventDefault()
      e.stopPropagation()
      this.dragging = true,
      this.start = e.clientY
    },
    // 鼠标移动 => 拖动进行中
    // 根据鼠标在垂直方向移动距离计算新的滚动位置next（百分比），父组件根据next调整视图的marginTop，并更新scrolling值，反馈到滚动条的位移上
    onDrag (e) {
      if (this.dragging) {
        this.$emit('dragging')
        e.preventDefault()
        e.stopPropagation()

        let yMovement = e.clientY - this.start
        let yMovementPercentage = yMovement / this.wrapperHeight * 100
        this.start = e.clientY

        let next = this.scrolling + yMovementPercentage
        this.$emit('change-position', next, 'vertical')
      }
    },
    // 鼠标松开 => 停止拖动
    stopDrag (e) {
      if (this.dragging) {
        this.$emit('drag-stop')
        this.dragging = false
      }
    },
    // 点击滚动槽，快速滚动到指定位置
    onClick (e) {
      if (e.target === this.$refs.container) {
        let position = this.$refs.scrollbar.getBoundingClientRect()

        let yMovement = e.clientY - position.top
        let centerize = (this.height / 2)
        let yMovementPercentage = yMovement / this.wrapperHeight * 100 - centerize
        this.start = e.clientY

        let next = this.scrolling + yMovementPercentage
        this.$emit('change-position', next, 'vertical')
      }
    },
    // 计算滚动条高度
    calculateSize (source) {
      this.height = source.wrapperHeight / source.viewerHeight * 100
    },
    showBar () {
      this.opacity = 1
    },
    hiddenBar () {
      this.opacity = 0
    }
  }
}
</script>

<style scoped>
.vue-scrollbar-vertical{
  position: absolute;
  width: 6px;
  height: 100%;
  top: 0;
  right: 2px;
  background: transparent;
}
.vue-scrollbar-vertical .scrollbar-inner{
  position: relative;
  width: 6px;
  border-radius: 4px;
  cursor: default;
}
</style>