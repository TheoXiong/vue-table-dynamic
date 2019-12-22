# vue-table-dynamic

简体中文 | [English](./README.md)

[vue-table-dynamic](https://github.com/TheoXiong/vue-table-dynamic) 是一个动态表格组件。面向运行时，实时响应源数据变化，动态更新表格内容与形态。具有丰富的特性，所有特性均可按需引入，满足多样化需求。     

## 特性
- [多选](#多选)
- [搜索](#搜索)
- [排序](#排序)
- [筛选](#筛选)
- [分页](#分页)
- [编辑](#编辑])
- [边框](#边框)
- [条纹](#条纹)
- [高亮](#高亮)
- [配置列宽](#配置列宽)
- [配置表头](#配置表头)
- [固定表头](#固定表头)

## Demo
[https://theoxiong.github.io/vue-table-dynamic/](https://theoxiong.github.io/vue-table-dynamic/) 

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

### 基础表格

基础表格用法

![basic](./docs/images/basic.png)

```
<template>
  <div class="base-demo" style="width: 400px">
    <vue-table-dynamic :params="params"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'

export default {
  name: 'Demo',
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

### 边框

配置`border`属性，使用带边框表格

![border](./docs/images/border.png)   

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic :params="params" ref="table"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        border: true
      }
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 条纹

配置`stripe`属性，显示行条纹            

![stripe](./docs/images/stripe.png)   

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic :params="params" ref="table"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418'],
          [4, 'hf7y8c', '4rghjk', 'cgnhik']
        ],
        header: 'row',
        border: true,
        stripe: true
      }
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 高亮
    
配置`highlight`属性，指定行/列/单元高亮              

- `highlight`类型为`{row?:Array<number>; column?:Array<number>; cell?:Array<[number,number]>;}`。如：`{row: [1], column: [1], cell: [[-1, -1]]}`，负数表示倒序索引 
- `highlightedColor:`*`string`* 设置高亮背景色

![highlight](./docs/images/highlight.png)   

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic :params="params" ref="table"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418'],
          [4, 'hf7y8c', '4rghjk', 'cgnhik']
        ],
        header: 'row',
        border: true,
        stripe: true,
        highlight: { column: [-2] },
        highlightedColor: 'rgb(243, 235, 200)'
      }
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 多选

配置`showCheck`属性，启用多选功能   

- 通过`select`事件和`selection-change`事件，监听用户勾选操作      
- 通过`getCheckedRowDatas`方法获取当前所有选中的行数据      
- 通过`setAllRowChecked`方法将选中状态切换为全选或清空选择             

![checkbox](./docs/images/checkbox.png)   

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      @select="onSelect" 
      @selection-change="onSelectionChange"
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        showCheck: true
      }
    }
  },
  methods: {
    onSelect (isChecked, index, data) {
      console.log('onSelect: ', isChecked, index, data)
      console.log('Checked Data:', this.$refs.table.getCheckedRowDatas(true))
    },
    onSelectionChange (checkedDatas, checkedIndexs, checkedNum) {
      console.log('onSelectionChange: ', checkedDatas, checkedIndexs, checkedNum)
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 搜索

配置`enableSearch`属性，启用全局搜索功能，仅显示匹配到搜索关键字的行 

- 通过`search`方法可以手动对行搜索过滤，适用于自定义搜索框（配置`enableSearch`为`false`）     

![search](./docs/images/search.png)   

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        enableSearch: true
      }
    }
  },
  methods: {
  },
  components: { VueTableDynamic }
}
</script>
```

### 排序

配置`sort`属性，启用排序功能，基于列数据对行进行排序   

- `sort`类型为`Array<number>`，数组成员为启用排序的列索引。如：`sort: [0, 1]`，基于第0列和第1列排序 

![sort](./docs/images/sort.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        sort: [0, 1]
      }
    }
  },
  methods: {
  },
  components: { VueTableDynamic }
}
</script>
```

### 筛选

通过`filter`配置具有筛选功能的列以及筛选条件   

- `filter`类型为`Array<{column:number; content:Array<{text:string; value:string|number;}>; method:function;}>`。 如：`[{column: 0, content: [{text: '> 2', value: 2}], method: (value, cell) => { return cell.data > value }}]`            
- `filter[].column` 列索引     
- `filter[].content`筛选项    
- `filter[].method` 筛选的方法，如果是多选的筛选项，对每一条数据会执行多次，任意一次返回 true 就会显示。     

![filter](./docs/images/filter.png) 

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Time'],
          [1, 'b3ba90', '9a3853', '2019-01-01 10:10'],
          [2, 'ec0b78', 'ecf03c', '2019-02-02 11:11'],
          [3, '7c95f7', 'fdf451', '2019-02-02 12:12'],
          [4, 'ba045d', '34fdgh', '2019-02-02 13:13'],
          [5, 'a8c325', '4678de', '2019-03-03 14:14']
        ],
        header: 'row',
        filter: [{
          column: 0, 
          content: [{text: '> 2', value: 2}, {text: '> 4', value: 4}], 
          method: (value, tableCell) => { return tableCell.data > value }
        }, {
          column: 3, 
          content: [{text: '2019-01-01', value: '2019-01-01'}, {text: '2019-02-02', value: '2019-02-02'}], 
          method: (value, tableCell) => { return String(tableCell.data).toLocaleLowerCase().includes(String(value).toLocaleLowerCase()) }
        }],
      }
    }
  },
  methods: {
  },
  components: { VueTableDynamic }
}
</script>
```

### 分页

配置`pagination`属性，启用分页功能，支持配置每页显示条数和条数可选项      

- `pagination:boolean`为`true`时启用分页功能      
- `pageSize?:number` 每页显示行数，默认为`10`     
- `pageSizes?:Array<number>` 每页行数可选项，默认为`[10, 20, 50, 100]`    

![pagination](./docs/images/pagination.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'

const random = () => {
  return parseInt(Date.now() + Math.random() * 10000000).toString(16).slice(-6)
}

export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', `Data1`, `Data2`, `Data3`]
        ],
        header: 'row',
        border: true,
        stripe: true,
        pagination: true,
        pageSize: 5,
        pageSizes: [5, 10, 20, 50]
      }
    }
  },
  mounted () {
    for (let i = 0; i < 100; i++) {
      this.params.data.push([i+1, `${random()}`, `${random()}`, `${random()}`])
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 编辑

配置`edit`属性，启用编辑功能，支持配置某行/某列/某个表格单元可编辑 

- `edit`类型为`{row?:Array<number>; column?:Array<number>; cell?:Array<[number,number]>;}`。如：`{row: [1], column: [1], cell: [[-1, -1]]}`，负数表示倒序索引     
- 配置为`{row: 'all'}`时，所有单元均可编辑        
- 通过`cell-change`事件，监听编辑操作        
- 编辑会改变当前数据，不会改变传入的源数据    
- 通过`getData`方法，可获取编辑后的最新数据       
- 如果配置了 `header: 'row'`，则第一行表头不可编辑       

![edit](./docs/images/edit.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params"
      @cell-change="onCellChange"
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        edit: {
          row: [1],
          column: [1],
          cell: [[-1, -1]]
        }
      }
    }
  },
  methods: {
    onCellChange (rowIndex, columnIndex, data) {
      console.log('onCellChange: ', rowIndex, columnIndex, data)
      console.log('table data: ', this.$refs.table.getData())
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 配置列宽

通过`columnWidth`属性配置表格列宽度   

- `columnWidth`类型为`Array<{column:number; width:number|string;}>`。如：`[{column: 0, width: 60}, {column: 3, width: '15%'}]`
- `columnWidth[].column` 列索引
- `columnWidth[].width` 列宽度，支持像素值(number)和百分比(string)

![width](./docs/images/width.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic :params="params" ref="table"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'row',
        border: true,
        columnWidth: [{column: 0, width: 60}, {column: 3, width: '15%'}],
      }
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 配置表头

通过`header`属性配置表头

- `header: row` 首行为表头
- `header: column` 首列为表头
- `header: ''` 无表头

![header](./docs/images/header.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic :params="params" ref="table"></vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', 'Data1', 'Data2', 'Data3'],
          [1, 'b3ba90', '7c95f7', '9a3853'],
          [2, 'ec0b78', 'ba045d', 'ecf03c'],
          [3, '63788d', 'a8c325', 'aab418']
        ],
        header: 'column',
        border: true,
        columnWidth: [{column: 0, width: 60}]
      }
    }
  },
  components: { VueTableDynamic }
}
</script>
```

### 固定表头

通过`height`配置表格高度即可固定表头。当表格超出配置高度，垂直滚动时首行表头会固定不动

- `height: number` 表格可视高度    
- 当`header`不为`row`时，首行被视为普通表格行，会跟随滚动   

![height](./docs/images/height.png)  

```
<template>
  <div style="width: 600px">
    <vue-table-dynamic 
      :params="params" 
      ref="table"
    >
    </vue-table-dynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'

const random = () => {
  return parseInt(Date.now() + Math.random() * 10000000).toString(16).slice(-6)
}

export default {
  name: 'Demo',
  data() {
    return {
      params: {
        data: [
          ['Index', `Data1`, `Data2`, `Data3`]
        ],
        header: 'row',
        border: true,
        stripe: true,
        height: 180
      }
    }
  },
  mounted () {
    for (let i = 0; i < 12; i++) {
      this.params.data.push([i+1, `${random()}`, `${random()}`, `${random()}`])
    }
  },
  components: { VueTableDynamic }
}
</script>
```

## API

### 属性

- 传入到组件的`props`只有`params`对象，下表的属性均为`params`对象的一级属性
- `data`为必需属性，其他均为可选项

| 属性名  | 说明   | 类型      | 可选值      | 默认值    |
| ----| --------- | ------- | ------------- | --------- |
| `data`   | 表格源数据 | `Array<[number, ..., number]>` | - | `[]` |
| `header` | 表头配置 | `string` | `row`: 首行表头; `column`: 首列表头; 其他: 无 | 无表头  |
| `border` | 是否带边框 | `boolean` | `true`/`false` | `false` |
| `stripe` | 是否带条纹 | `boolean` | `true`/`false` | `false` |
| `highlight` | 高亮的行/列/表单元。值为负数时，表示倒序索引 | {row?:Array<>; column?:Array<>; cell?:Array<>;} | - | `{}` |
| `highlightedColor` | 高亮的颜色 | `string` | - | `#EBEBEF` |
| `showCheck` | 显示多选框。仅当`header`为`row`时，第一行第一列为全选框，否则第一列均为当前行的勾选框 | `boolean` | `true`/`false` | `false` |
| `enableSearch` | 使用全局搜索功能 | `boolean` | `true`/`false` | `false`   |
| `minWidth` | 表最小宽度 | `number` | - | `300` |
| `maxWidth` | 表最大宽度 | `number` | - | `1000` |
| `height` | 表可视高度。通过配置表格高度，（当`header`为`row`时）可固定表头。当表格超出配置高度，垂直滚动时首行表头会固定不动 | `number` | -  | - |
| `rowHeight` | 行高  | `number`  | `>= 24` | `30` |
| `columnWidth` | 指定某一列或某几列的宽度，剩余列宽度均分。`width`值可为绝对值或相对百分比 | Array<{column: number; width: number/string;}> | - | - |
| `sort` | 指定可排序的列 | `Array<number>` | - | - |
| `filter` | 指定可筛选的列。`column`为列索引; `content`为筛选项;  `method` 为筛选的方法，同时选中多个筛选项时任意一次返回true就会显示 | Array<{column, content, method}> | - | - |
| `edit` | 可编辑的 行、列、表单元。负数表示倒序（如`-1`为最后`1`行、列）配置`row`为` 'all'`时，所有行可编辑。编辑会改变当前数据，不会改变传入的源数据| {row?: Array<>; column?: Array<>; cell?: Array<>;} | -  | - |
| `pagination` | 使用分页   | `boolean`  | `true`/`false` | `false`   |
| `pageSize`  | 每页行数 | `number`   | -   | `10` |
| `pageSizes` | 每页行数的可选项 | `Array<number>`  | - | |

### 方法

| 方法名  | 说明     | 参数       | 返回  |
| ------- | -------- | --------- | ---------- |
| `getData`  | 获取表格数据。当使用编辑功能时，可使用此方法获取编辑后的最新数据 | 无    | `Array<[number, ..., number]>` |
| `getCheckedRowDatas` | 使用多选功能时，获取选中行的数据 | `includeWhenHeaderInfirstRow: boolean` 当首行为表头时，是否包含表头行，默认`false` | `Array<[number, ..., number]>` |
| `getRowData` | 根据行索引获取指定行的数据  | `rowIndex: number` 行索引；`isCurrent: boolean`索引是否为排序后的索引，默认false，即原始索引 | `Array<number>` |
| `search`  | 手动对行搜索过滤，适用于自定义搜索框（配置`enableSearch`为`false`） | `searchValue: string`搜索的关键字   | 无 |
| `clearSearch`  | 取消搜索过滤，显示所有行 | 无  | 无  |

### 事件

| 事件名        | 说明                     | 回调参数                                                     |
| ------------- | ------------------------ | -----------------------------------------------------------|
| `select`      | 行的选中/取消选中        | `checked: boolean`; ` index: number`; `data: Array<string\number>` |
| `select-all`  | 全选/取消全选            | `isCheckedAll: boolean`                                      |
| `row-click`   | 点击行                   | ` index: number`; ` data: Array<string\number>`              |
| `cell-click`  | 点击表格单元             | `rowIndex: number`;  `columnIndex: number`; ` data: string\number` |
| `cell-change` | 表格单元数据（编辑）改变 | `rowIndex: number`;  `columnIndex: number`; ` data: string\number` |
| `sort-change` | 排序                     | `index: number`;  `value: string`                            |



