# vue-table-dynamic

[vue-table-dynamic](https://github.com/TheoXiong/vue-table-dynamic) 是一个动态表格组件

## 特性
- 面向运行时，实时响应源数据变化，动态更新表格内容与形态
- 支持过滤、排序、分页、上传、下载、插槽、主题等特性，所有特性均可按需配置启用或禁用

> 部分特性正开发中，敬请期待。

## Demo
链接： [https://theoxiong.github.io/vue-table-dynamic/](https://theoxiong.github.io/vue-table-dynamic/) 

![Demo](./demo.png)

## 安装
``` 
$   npm install vue-table-dynamic --save
```

## 使用

### 引入模块
```
import VueTableDynamic from 'vue-table-dynamic'
```

### 注册
#### 全局注册
```
Vue.use(VueTableDynamic)
```
#### 组件内注册
```
<script>
export default {
  components: { VueTableDynamic }
}
</script>
```
### 基础用法
```
<template>
  <div class="base-demo" style="width: 400px">
    <vue-table-dynamic :params="params"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'

export default {
  name: 'Home',
  data() {
    return {
      params: {
        data: [
          ['Cell-1', 'Cell-2', 'Cell-3'],
          ['Cell-4', 'Cell-5', 'Cell-6'],
          ['Cell-7', 'Cell-8', 'Cell-9']
        ]
      }
    }
  },
  components: { VueTableDynamic }
}

</script>
```
## API
