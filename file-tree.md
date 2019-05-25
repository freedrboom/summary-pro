## vue技术介绍

## vue项目目录结构
> tree -L 2 -I "node_modules|dist|build" -d


>
    ├── config
    └── src
        ├── api
        ├── assets
        ├── components
        ├── conf
        ├── directives
        ├── filters
        ├── global
        ├── mixins
        ├── pages
        ├── router
        ├── store
        └── v0.7

    14 directories


### api 目录
 > tree -L 2 src/api
src/api // 对于多人开发的，每个人都建个目录 或者以项目来功能来分目录，主要是为了减少多人对同一个文件（甚至同一段代码编辑），每个目录再有个index来统一导出

├── index.js //统一导出
├── freedrb 
│   └── index.js
└── yf-api
    └── index.js

2 directories, 3 files

freedrb/index.js

import { axios, getObject, phoneValidate, MyError, getUserInfo, setUserInfo } from '@/global';
/**
 * @description 获取我的订单（预估收益）列表
 * @params {statsDate} 筛选的时间条件
 */
export const getAllCardOrderList = ({
    pageSize = 10,
    pageNum = 1,
    statsDate = ""
}) => {
    return axios.request({
        url: '/api/user/order/getAllCardOrderList',
        method: 'get',
        data: {
            pageSize,
            pageNum,
            statsDate
        }
    }).then(res => { // 转换下数据格式，后端不给做，但一个相同的列表需要展示两个不同接口（不同数据结构）的数据，只能选择转其中一个
        return res.map(item => Object.assign(getObject(item, ["userName", "levelName", "createdAt", ["cardNum", "count"], "id"]), {productName: "会员卡"}))
    });
};


// 为了防止同一个接口在多处调用，或者Promise.all()的时候，还需重复判断http状态码以及业务状态码 此处导出的api调用函数  保证.then的回调里是成功的，与后端商定的状态吗啥的以及在axios拦截做好了  也就是 在页面里  .then 的回调保证 以及正确的调用接口了  无需再.then的回调里再判断状态码，.catch的回调就是表示该业务接口调用失败了


### assets 目录
在该目录里放些静态资源，如小图标，某些css(animate.css)

### components
weigu@weigu-pc ~/D/sales-system> tree -L 2 src/components/
src/components/
├── index.js
├── no-more.vue
├── phone-area-code.vue
└── sticky.vue

0 directories, 4 files

某一个组件的简单例子
ss.vue

<!--组件-->
<template>

  <section>
    <!--内容-->
  </section>
</template>

<script>
export default {
  name: "sticky", // 当前组件的名字
  props: { // 传进来的组件属性  也可以是数组的形式，不一定非要对象的形式
    left: { // 属性名
      type: [String, Number], //接受的值的类型
      default: 'unset', // 默认值
    },
  },
  model: { // 可以给自定义组件使用v-model指令
    prop: "left",
    event: "change"
  },
  data() { // 当前组件的内部数据
    return {
        areaCodeChooseShow: false
    }
  },
  components: { // 注册当前引入的局部组件
  }
  updated() { // 组件更新之后触发的钩子函数
    
  },
  computed() { // 组件的计算属性

  }
  mounted() { // 组件被挂载之后的钩子函数

  },

  beforeDestroy() { // 组件被销毁前的
  },

  methods: { // 组件内部的方法
    scrollHandler() {
    },
      areaCodeChoose(index, menuItem) {
        if (index!=="cancel") {
            this.$emit("change", codes[index] || codes.shift())
        }
    },
    setAreaCodeChooseIsShow(isShow = false) {
      if (!this.isDisabled) {
        this.areaCodeChooseShow = !!isShow;
      }
    }
  },
}
</script>
