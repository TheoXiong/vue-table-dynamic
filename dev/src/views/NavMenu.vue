<template>
  <div class="nav-menu dev-flex-c-b">
    <div class="nav-logo dev-flex-c">
      <img :src="logoImg" class="nav-logo-img">
      <span class="nav-logo-text">{{ logoText }}</span>
    </div>
    <div class="nav-content dev-flex-c">
      <div class="nav-content-item dev-flex-c-c"
        :class="{ 'is-active': activate === item.key }"
        v-for="item in menus"
        :key="item.key"
        @click="onClick(item)"
      >
        {{ item.name }}
        <div class="nav-content-item-line" v-show="activate === item.key"></div>
      </div>
    </div>
  </div>
</template>

<script>
import logoImg from '@/assets/image/logo.png'

export default {
  name: 'NavMenu',
  data () {
    return {
      logoImg,
      logoText: 'Vue Table Dynamic',
      menus: [{
        key: 'default',
        name: 'Default Style',
      }, {
        key: 'slot',
        name: 'Custom Cell',
      }, {
        key: 'custom',
        name: 'Custom Style',
      }, {
        key: 'github',
        name: 'GitHub',
      }],
      activate: 'default'
    }
  },
  methods: {
    onClick (item) {
      if (item.key === 'github') {
        window.open('https://github.com/TheoXiong/vue-table-dynamic', '_blank')
      } else {
        this.activate = item.key
        this.$emit('nav', item.key)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.nav-menu {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20px;
  color: #FFFFFF;
  transition: all 0.4s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none;
  background-color: rgb(40,44,52);
  box-shadow: 1px 1px 4px 1px rgba(40,44,52, 0.7);
}

.nav-logo-img{
  width: 24px;
  height: 24px;
}
.nav-logo-text{
  margin-left: 14px;
  font-size: 20px;
  color: #FFFFFF;
  font-weight: 600;
}

.nav-content-item{
  box-sizing: border-box;
  position: relative;
  height: 40px;
  margin: 0 12px;
  font-size: 14px;
  letter-spacing: 1px;
  color: #FFFFFF;
  cursor: pointer;
}
.nav-content-item:hover{
  color: #E0D5D5;
}
// .nav-content-item.is-active, .nav-content-item.is-active:hover{
//   color: #046FDB;
// }
.nav-content-item-line{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: #FFFFFF;
}

</style>