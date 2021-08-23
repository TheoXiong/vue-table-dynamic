<template>
  <div
    class="vue-search-wrap"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    :style="{
      backgroundColor: inputBackground
    }"
  >
    <input
      class="vue-search"
      ref="input"
      v-bind="$attrs"
      :placeholder="placeholder"
      :type="type"
      :class="{
        'placeholder-light': placeholderEffect === 'light',
        'placeholder-dark': placeholderEffect === 'dark',
        'suffix': $slots.suffix || suffixIcon,
        'prefix': $slots.prefix
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
      @keydown.enter="handleSearch"
    >
    <span class="vue-search-prefix" v-if="$slots.prefix" :style="{ color: borderColor }">
      <slot name="prefix"></slot>
    </span>
    <span class="vue-search-suffix" v-if="$slots.suffix || suffixIcon">
      <slot name="suffix"></slot>
      <i class="iconfont" v-if="suffixIcon" :class="suffixIcon"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'VueSearch',
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
    inputColor: { type: String, default: 'rgba(0,0,0,0.85)' },
    inputBackground: { type: String, default: 'transparent' },
    inputBorderColor: { type: String, default: '#8c8c8c' },
    inputBorderColorHovering: { type: String, default: '#8c8c8c' },
    inputBorderColorFocused: { type: String, default: '#046FDB' },
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
    handleSearch () {
      this.$emit('search')
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

<style lang="scss" scoped>
.vue-search-wrap{
  box-sizing: border-box;
  font-size: 12px;
  font-family: inherit;
  width: 100%;
  max-width: 200px;
  display: inline-block;
  position: relative;
}
.vue-search{
  -webkit-appearance: none;
  background-color: transparent;
  background-image: none;
  border: none;
  border-bottom: 1px solid;
  box-sizing: border-box;
  display: inline-block;
  font-size: inherit;
  height: 26px;
  line-height: 26px;
  outline: 0;
  padding: 0px;
  padding-left: 2px;
  width: 100%;
}
.vue-search:hover,
.vue-search:focus,
.vue-search:active{
  outline: 0;
}
.vue-search-prefix{
  position: absolute;
  height: 100%;
  left: 0px;
  top: 0;
  text-align: center;
}
.vue-search.suffix{
  padding-right: 30px;
}
.vue-search.prefix{
  padding-left: 30px;
}
.vue-search-suffix{
  position: absolute;
  height: 100%;
  right: 0px;
  top: 0;
  text-align: center;
  color: rgba(0,0,0,0.65);
  &:hover,
  &:focus {
    color: #046FDB;
  }
}
i.iconfont{
  height: 100%;
  width: 22px;
  font-size: 16px;
  transition: all 0.3s;
  line-height: 26px;
  display: inline-block;
  text-align: center;
  vertical-align: baseline;
  font-weight: 400;
  cursor: pointer;
}
i.iconfont:after {
  content: '';
  height: 100%;
  width: 0;
  display: inline-block;
  vertical-align: middle;
}
.vue-search::-ms-clear {
  display: none;
  width: 0;
  height: 0;
}
.vue-search.placeholder-light::-webkit-input-placeholder { /* WebKit, Blink, Edge */
  color:#C0C4CC;
}
.vue-search.placeholder-light:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
  color:#C0C4CC;
}
.vue-search.placeholder-light::-moz-placeholder { /* Mozilla Firefox 19+ */
  color:#C0C4CC;
}
.vue-search.placeholder-light:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color:#C0C4CC;
}

.vue-search.placeholder-dark::-webkit-input-placeholder { /* WebKit, Blink, Edge */
  color:#909399;
}
.vue-search.placeholder-dark:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
  color:#909399;
}
.vue-search.placeholder-dark::-moz-placeholder { /* Mozilla Firefox 19+ */
  color:#909399;
}
.vue-search.placeholder-dark:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color:#909399;
}
</style>
