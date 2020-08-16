<template>
  <div
    class="vue-input-wrap"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    :style="{
      backgroundColor: inputBackground
    }"
  >
    <input
      class="vue-input"
      ref="input"
      v-bind="$attrs"
      :placeholder="placeholder"
      :type="type"
      :class="{
        'placeholder-light': placeholderEffect === 'light',
        'placeholder-dark': placeholderEffect === 'dark',
        'prefix': $slots.prefix || prefixIcon,
        'suffix': $slots.suffix || suffixIcon
      }"
      :style="{
        color: inputColor,
        borderColor: borderColor
      }"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    >
    <span class="vue-input-prefix" v-if="$slots.prefix || prefixIcon">
      <slot name="prefix"></slot>
      <i class="iconfont" v-if="prefixIcon" :class="prefixIcon"></i>
    </span>
    <span class="vue-input-suffix" v-if="$slots.suffix || suffixIcon">
      <slot name="suffix"></slot>
      <i class="iconfont" v-if="suffixIcon" :class="suffixIcon"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'VueInput',
  data () {
    return {
      isComposing: false,
      hovering: false,
      focused: false
    }
  },
  props: {
    value: [String, Number],
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    placeholderEffect: { type: String, default: 'light' },
    inputColor: { type: String, default: '#606266' },
    inputBackground: { type: String, default: '#FFFFFF' },
    inputBorderColor: { type: String, default: '#DCDFE6' },
    inputBorderColorHovering: { type: String, default: '#C0C4CC' },
    inputBorderColorFocused: { type: String, default: '#046FDB' },
    prefixIcon: String,
    suffixIcon: String
  },
  computed: {
    nativeInputValue () {
      return this.value === null || this.value === undefined ? '' : String(this.value)
    },
    borderColor () {
      if (this.focused) {
        return this.inputBorderColorFocused
      } else if (this.hovering) {
        return this.inputBorderColorHovering
      } else {
        return this.inputBorderColor
      }
    }
  },
  watch: {
    nativeInputValue () {
      this.setNativeInputValue()
    }
  },
  mounted () {
    this.setNativeInputValue()
  },
  methods: {
    getInput () {
      if (this.$refs && this.$refs.input) {
        return this.$refs.input
      } else {
        return null
      }
    },
    focus () {
      this.$refs.input.focus()
    },
    blur () {
      this.$refs.input.blur()
    },
    handleCompositionStart () {
      this.isComposing = true
    },
    handleCompositionEnd (event) {
      this.isComposing = false
      this.handleInput(event)
    },
    handleInput (event) {
      if (this.isComposing) return
      if (event.target.value === this.nativeInputValue) return
      this.$emit('input', event.target.value)
      this.$nextTick(this.setNativeInputValue)
    },
    handleFocus (event) {
      this.focused = true
      this.$emit('focus', event)
    },
    handleBlur (event) {
      this.focused = false
      this.$emit('blur', event)
    },
    handleChange (event) {
      this.$emit('change', event.target.value)
    },
    setNativeInputValue () {
      const input = this.$refs.input
      if (!input) return
      if (input.value === this.nativeInputValue) return
      input.value = this.nativeInputValue
    }
  }
}
</script>

<style scoped>
.vue-input-wrap{
  box-sizing: border-box;
  border-radius: 2px;
  font-size: 12px;
  font-family: inherit;
  width: 100%;
  display: inline-block;
  position: relative;
}
.vue-input{
  -webkit-appearance: none;
  background-color: transparent;
  background-image: none;
  border-radius: 2px;
  border: 1px solid;
  box-sizing: border-box;
  display: inline-block;
  font-size: inherit;
  height: 28px;
  line-height: 28px;
  outline: 0;
  padding: 0px 15px;
  transition: border-color .2s ease;
  width: 100%;
}
.vue-input:hover,
.vue-input:focus,
.vue-input:active{
  outline: 0;
}
.vue-input.prefix{
  padding-left: 30px;
}
.vue-input.suffix{
  padding-right: 30px;
}
.vue-input-prefix{
  position: absolute;
  height: 100%;
  left: 5px;
  top: 0;
  text-align: center;
  color: #C0C4CC;
  transition: all 0.3s;
}
.vue-input-suffix{
  position: absolute;
  height: 100%;
  right: 5px;
  top: 0;
  text-align: center;
  color: #C0C4CC;
  transition: all 0.3s;
}
i.iconfont{
  height: 100%;
  width: 25px;
  transition: all 0.3s;
  line-height: 28px;
  display: inline-block;
  text-align: center;
  vertical-align: baseline;
  font-weight: 400;
}
i.iconfont:after {
  content: '';
  height: 100%;
  width: 0;
  display: inline-block;
  vertical-align: middle;
}
.vue-input::-ms-clear {
  display: none;
  width: 0;
  height: 0;
}
.vue-input.placeholder-light::-webkit-input-placeholder { /* WebKit, Blink, Edge */
  color:#C0C4CC;
}
.vue-input.placeholder-light:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
  color:#C0C4CC;
}
.vue-input.placeholder-light::-moz-placeholder { /* Mozilla Firefox 19+ */
  color:#C0C4CC;
}
.vue-input.placeholder-light:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color:#C0C4CC;
}

.vue-input.placeholder-dark::-webkit-input-placeholder { /* WebKit, Blink, Edge */
  color:#909399;
}
.vue-input.placeholder-dark:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
  color:#909399;
}
.vue-input.placeholder-dark::-moz-placeholder { /* Mozilla Firefox 19+ */
  color:#909399;
}
.vue-input.placeholder-dark:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color:#909399;
}
</style>
