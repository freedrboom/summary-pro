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
  watch: {// 监听数据的变化

  }
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

其中在index.js遍历该组件目录，动态全局注册组件

import Vue from 'vue'
const files = require.context('.', true, /\.vue$/)

files.keys().forEach(key => {
    let component = files(key).default
    Vue.component(component.name, component)
})


### conf里放些配置性的静态内容,或者声明


### directives 这里主要是自定义了一个下拉刷新的指令，并在directives/index.js里注册为全局下拉刷新

export default (() => {
    var style=document.createElement("style");
    style.setAttribute("type", "text/css");
    var cssString = `
      @keyframes loading {
          50% {
              transform: rotate(180deg)
          }
          100% {
              transform: rotate(360deg)
          }
      }

      #refresh-container {
          position: fixed;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.4);
          top: 0;
          right: 0;
          display: flex;
          justify-content:
          center borx-sizing:
          border-box;
          padding-top: 20px;
      }
      #refresh-container span {
          animation: loading 0.8s linear infinite;
          width:10px;
          height: 10px;
          margin: 0 auto;
          padding: 10px; border: 7px dashed #000;
          border-top-color: red;
          border-bottom-color: green;
          border-radius: 50%;
       }

       #refresh-container .spinner {
        width: 60px;
        height: 60px;

        position: relative;
        margin: 50px auto;
      }

      .double-bounce1, .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #67CF22;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 0;

        -webkit-animation: bounce-loading 2.0s infinite ease-in-out;
        animation: bounce-loading 2.0s infinite ease-in-out;
      }

      .double-bounce2 {
        -webkit-animation-delay: -1.0s;
        animation-delay: -1.0s;
      }

      @-webkit-keyframes bounce-loading {
        0%, 100% { -webkit-transform: scale(0.0) }
        50% { -webkit-transform: scale(1.0) }
      }

      @keyframes bounce-loading {
        0%, 100% {
          transform: scale(0.0);
          -webkit-transform: scale(0.0);
        } 50% {
          transform: scale(1.0);
          -webkit-transform: scale(1.0);
        }
      }
    `
    if (style.styleSheet) { // IE
      style.styleSheet.cssText = cssString;
    } else { // w3c
      var cssText = document.createTextNode(cssString);
      style.appendChild(cssText);
    }

    var heads = document.getElementsByTagName("head");
    if (heads.length) { heads[0].appendChild(style); } else { document.documentElement.appendChild(style); }
    let fun = function(e) {
        e = e || window.event;
        e.preventDefault? e.preventDefault() : e.returnValue = false
        if (e.stopPropagation) {
            e.stopPropagation();
            e.stopImmediatePropagation()
        } else {
            e.cancelBubble = true;
        }
    }
    let containers = {
       circle: "",
       default: ""
    }
    // style1
      let span = document.createElement("span");
      containers["default"] = span;
      let div1 = document.createElement("div");
      div1.setAttribute("class", "spinner");
      let div2 = document.createElement("div");
      div2.setAttribute("class", "double-bounce1")
      let div3 = document.createElement("div");
      div3.setAttribute("class", "double-bounce2")

      div1.appendChild(div2)
      div1.appendChild(div3)

      // style 2
      containers["circle"] = div1;
      let container = document.createElement("div");
      container.setAttribute("id", "refresh-container")
      // append default style
      container.appendChild(div1);
      container.onclick = fun;
      container.addEventListener('mousewheel', fun)
      container.addEventListener('touchmove', function (event) {
          event.preventDefault()
      }, {passive: false})
      let isAdded = false;
      let startY = 0;
      let currentY = 0;
      let top = 0;
      let startScroll = 0;
      let currentStyle = ""
      let touchStart = e => {
          if (isAdded) {
              fun(e)
              return;
          }
          // 记录手指触摸位置y轴位置
          if (currentY > 0) return;
          currentY = e.targetTouches[0].pageY;
          startScroll = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
          startY = currentY;
          // 开启滑动记录
      };
      let touchMove = e => {
          if (startScroll>10) {
              return
          }
          if (isAdded) {
              return;
          }
          //  获取拉取的间隔差   当前移动的y点      初始的y点        初始顶部距离
          let diff = e.targetTouches[0].pageY - startY - startScroll;
          // 如果是往上滑的话，就取消事件
          currentY = e.targetTouches[0].pageY;
          top = e.targetTouches[0].pageY - startY;
          if (diff > 0) e.preventDefault();
          if (top>150) {
              top = 150;
          }
          if (top > 0 && top < 40) {
              if (!isAdded) {
                  let tempStyle = ["circle", "default"].find(item => item==currentStyle) || "default"
                  container.replaceChild(containers[tempStyle], container.childNodes[0])
                  document.body.appendChild(container)
                  isAdded = true;
              }
          }
          e.currentTarget.style.transform = `translateY(${top}px)`;
          e.currentTarget.style.WebkitTransform = `translateY(${top}px)`
      };
      let touchEnd = e => {
          top = 0;
          e.currentTarget.style.cssText = `top: 0`;
          e.currentTarget.style.transform = `-webkit-transform 500ms translateY(${top}px)`;
          e.currentTarget.style.WebkitTransform = `-webkit-transform 500ms translateY(${top}px)`
          if (reFetch) {
              reFetch(refreshDone)
              // reFetch()
          }
      };
      let refreshDone = () => {
          startY = 0;
          currentY = 0;
          top = 0;
          if (isAdded) {
              document.body.removeChild(container)
              isAdded = false;
          }
          // 下拉刷新后，对数据还原，获取第一页数据，重新注册滚轮事件
      };
      let reFetch = null;
      return {
          // 当被绑定的元素插入到 DOM 中时……
          inserted(el, binding, vnode) {
              el.addEventListener('touchstart', touchStart)
              el.addEventListener('touchmove', touchMove)
              el.addEventListener('touchend', touchEnd)
          },
          update() {},
          componentUpdated(el, binding, vnode) {
            currentStyle = binding.arg;
              let expression = binding.expression;
              if (expression&&vnode.context[expression]) {
                  reFetch = vnode.context[expression]
              } else {
                  reFetch = null;
              }
          },
          unbind(el, binding, vnode) {
              reFetch = null
              el.removeEventListener('touchstart', touchStart)
              el.removeEventListener('touchmove', touchMove)
              el.removeEventListener('touchend', touchEnd)
          }
      };
  })();

### filters 自已过滤？还是转换？ 主要给某一数据转换下
weigu@weigu-pc ~/D/sales-system> tree -L 2 src/filters/
src/filters/
├── dateformat.js
└── index.js

0 directories, 2 files

比如在当前项目里主要是要到了 时间格式化的，手机号码中间部分变成****的 以及 钱的单位格式化  比如前面统一加￥之类的，以及项目的一些 类似于等级（数字）映射成待显示的等级

### mixins
```javascript
import wx from 'weixin-js-sdk'
import { checkIsLogined } from "../global/utils/localUser"

export const shouldLoginMixin = {
  beforeRouteEnter(to, from, next) { // 全局混入路由钩子函数 ，用来拦截是否已经登录，除了登录页本身，其他页面要求必须登录 ，这个根据业务来定
    if (!checkIsLogined() && ["login"].indexOf(to.name) === -1) {
      // AuthorizationToLogin()
      next({name: "login"})
    } else {
      next((vm) => { // 通过next的回调，来隐藏微信右上角的菜单，项目要求每个页面都不能有； 以及记录下从哪个页面过来 主要是为来自不同的页面需要不同的逻辑处理的情况
        wx.hideOptionMenu()
        vm.routerFrom = from.name
      })
    }
  },
  beforeRouteLeave (to, from, next) { // 全局混入一个离开的路由钩子函数，用来记录离开前滚动条的位置，方便在返回来当前页面的好滚动到上次离开的位置
  // document.documentElement.scrollTop
  from.meta.savedPosition = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
  next()
},
// mounted() { // 
//   this.isMounted = true;
//   setTimeout(() => { this.isMounted = false }, 0)
// },
  methods: {
    pushRoute(route) {
      if (typeof route == "string") {
        this.$router.push({name: route})
      } else {
        this.$router.push(route)
      }
    },
    triggerSomeDomRerender(dom) {
      if (dom && dom.style) {
        let temp = dom.style.bottom
       dom.style.bottom = "1px"
       dom.style.bottom = temp
      }
    },
    backAction() {
      this.$router.go(-1)
    },
    changeHref(url) {
      if (url&&/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/.test(url)) {
        location.href = url
      }
    },
    jumpMall(path) { // 跳到商城
      if (path.indexOf("http")===-1) {
        let origin = location.origin.indexOf("//sales") !== -1 ? "http://mall.xc2018.com.cn" : "http://tmall.xc2018.com.cn"
        window.location.href = path&&path[0]==='/'?`${origin}${path}` : `${origin}/${path}`;
      } else {
        window.location.href = path
      }
  },
  }
}
```