<template>
  <div class="home">
    <header>
      <nav-menu @nav="onNav"></nav-menu>
    </header>
    <section>
      <keep-alive>
        <default-style v-if="layout === 'default'"></default-style>
        <custom-style v-else-if="layout === 'custom'"></custom-style>
        <custom-cell v-else-if="layout === 'slot'"></custom-cell>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import NavMenu from './NavMenu.vue'
import DefaultStyle from './DefaultStyle.vue'
import CustomStyle from './CustomStyle.vue'
import CustomCell from './CustomCell.vue'

export default {
  name: 'Home',
  data() {
    return {
      layout: 'default'
    }
  },
  methods: {
    onNav (key) {
      this.layout = key
    }
  },
  components: { NavMenu, DefaultStyle, CustomStyle, CustomCell }
}
</script>

<style lang="scss" scoped>
.home{
  height: 100%;
  width: 100%;
  min-width: 500px;
  position: relative;
  header {
    width: 100%;
    height: 70px;
  }
  section {
    position: absolute;
    top:70px;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0;
  }
}

</style>