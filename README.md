# react-native-order-flat-list
你可以通过手势上下拖动自由地排序列表

### 安装

```bash
npm install react-native-order-flat-list --save
```

### 属性

| parameter              | type                                       | required | default | description                                                                                                                                                                                                                        
| :--------------------- | :----------------------------------------- | :------- | :-------| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| style                  | oneOfType([number, object, array])         | no       |         | 组件样式                                                                                                                                                                                                                     
| orderStyle             | oneOfType([number, object, array])         | no       |         | 排序样式                                                                                                                                                                                                                   
| orderWidth             | number                                     | no       | 44      | 排序按钮宽    
| icon                   | number                                     | no       |         | 图标
| iconStyle              | oneOfType([number, object, array])         | no       |         | 图标样式
| getListRef             | func                                       | no       |         | 获取列表ref
| itemHeight             | number                                     | yes      |         | 列表项高度
| orderKeyName           | string                                     | no       |         | 列表排序字段
| isOrder                | bool                                       | no       | false   | 是否排序
| renderFrameTime        | number                                     | no       | 20      | 渲染帧时间(ms;不建议太大或太小)
| onOrder                | func                                       | yes      |         | 排序 {<br><br>orderKeys: 排序字段(,分隔;orderKeyName不为空时有值),<br><br>list: 列表,<br><br>orderItemKey: 排序项字段(orderKeyName不为空时有值),<br><br>moveItemKey: 移动项字段(orderKeyName不为空时有值),<br><br>orderItemIndex: 排序项位置,<br><br>moveItemIndex: 移动项位置<br><br>}                                                                                                                                                                                                      

### 注意
属性props支持所有FlatList的props
<br>
你应该依赖props.onOrder({orderKeys, list, orderItemKey, moveItemKey, orderItemIndex, moveItemIndex})的回调参数调整props.data使其发生排序改变并操作你的后端api
<br>
你可以选择在即将提交到后端时替换你的data数据使其列表即时发生改变,这样不会有卡顿或迟缓。比如在reducer的`REQUESTING_${ACTION_TYPES.ACTION_TYPE}`里

### 源码

https://github.com/thisXY/react-native-order-flat-list
