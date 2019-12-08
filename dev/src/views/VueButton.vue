<template>
  <button class="vue-button"
          ref="vbutton"
          @click="handleClick"
          :disabled="disabled || loading"
          :type="nativeType"
          :class="[
            type ? 'vue-button--' + type : '',
            size ? 'vue-button--' + size : '',
            {
              'is-disabled': disabled,
              'is-loading': loading,
              'is-activated': activated
            }
  ]">
    <i :class="icon" v-if="icon"></i>
    <span v-if="$slots.default" :class="{hidden: loading, show: !loading}"><slot></slot></span>
    <div class="vue-button-loading" v-if="loading">
      <i class="iconfont iconloading loading-item"></i>
    </div>
  </button>
</template>
<script>
export default {
  name: 'VueButton',
  props: {
    type: { type: String, default: 'default' },
    size: { type: String, default: 'small' },
    icon: { type: String, default: '' },
    nativeType: { type: String, default: 'button' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    activated: { type: Boolean, default: false }
  },
  methods: {
    handleClick (event) {
      this.$emit('click', event)
    },
    focus () {
      if (this.$refs && this.$refs.vbutton) {
        this.$refs.vbutton.focus()
      }
    }
  }
}
</script>

<style scoped>
.vue-button{
  display:inline-block;
  line-height:1;
  white-space:nowrap;
  cursor:pointer;
  background:rgb(59, 63, 73);
  border:1px solid rgb(59, 63, 73);
  color:#FFFFFF;
  -webkit-appearance:none;
  text-align:center;
  box-sizing:border-box;
  outline:0;
  margin:0;
  transition:.1s;
  font-weight:500;
  -webkit-user-select:none;
  padding:6px 12px;
  font-size:14px;
  border-radius:2px;
}
.vue-button [class*=el-icon-]+span{
  margin-left:5px;
}

/* default button style*/
.vue-button.is-disabled,
.vue-button.is-disabled:focus,
.vue-button.is-disabled:hover{
  cursor:not-allowed;
  color: #909399;
  background-image:none;
  background-color:transparent;
  border: 1px solid #EAEAF3;
}
.vue-button:focus,
.vue-button:hover{
  color:#FFFFFF;
  border-color:rgb(77, 81, 92);
  background: rgb(77, 81, 92);
  outline:0;
  border-radius:2px;
}
.vue-button:active{
  background:rgb(51, 54, 63);
  border-color: rgb(51, 54, 63);
  color:#FFFFFF;
  outline:0;
}

/* text button style*/
.vue-button.vue-button--text{
  color:#606266;
  background-color:transparent;
  border: 1px solid #DCDFE6;
  outline: 0;
  border-radius: 2;
}
.vue-button--text:hover{
  border: 1px solid #409EFF;
  outline: 0;
  border-radius: 2;
}

.vue-button--text.is-disabled,
.vue-button--text.is-disabled:active,
.vue-button--text.is-disabled:focus,
.vue-button--text.is-disabled:hover{
  cursor:not-allowed;
  color: #909399;
  background-image:none;
  background-color:transparent;
  border: 1px solid #EAEAF3;
  outline: 0;
  border-radius: 2;
}

.vue-button--text.is-activated,
.vue-button--text.is-activated:active,
.vue-button--text.is-activated:focus,
.vue-button--text.is-activated:hover{
  background:#EAEAF3;
  border: 1px solid #409EFF;
  outline: 0;
  border-radius: 2;
}

/* mini button style*/
.vue-button--mini{
  font-size: 12px;
  padding: 6px 8px;
}

/* medium button style*/
.vue-button--medium{
  font-size: 14px;
  padding: 10px 20px;
}

/* loading style*/
.vue-button.is-loading{
  position:relative;
  pointer-events:none
}
.vue-button-loading{
  position:absolute;
  pointer-events:none;
  left:-1px;
  top:-1px;
  right:-1px;
  bottom:-1px;
  border-radius:inherit;
  background-color:rgba(30,30,30,0.4);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden{
  opacity: 0.1;
}
.show{
  opacity: 1;
}
.loading-item{
  animation: rotate 1000ms linear infinite;
  transition: all 0.3s;
  display: inline-block;
  text-align: center;
  vertical-align: baseline;
}
@keyframes rotate {
  0% {transform: rotate(0deg)}
  100%  {transform: rotate(360deg)}
}

i.iconfont:after {
  content: '';
  height: 100%;
  width: 0;
  display: inline-block;
  vertical-align: middle;
}
</style>
