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
 > 
    tree -L 2 src/api
    src/api // 对于多人开发的，每个人都建个目录 或者以项目来功能来分目录，主要是为了减少多人对同一个文件（甚至同一段代码编辑），每个目录再有个index来统一导出
>
    ├── index.js //统一导出
    ├── freedrb 
    │   └── index.js
    └── yf-api
        └── index.js

    2 directories, 3 files

freedrb/index.js
```javascript
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

```
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
``` javascript
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
```
其中在index.js遍历该组件目录，动态全局注册组件
```javascript
import Vue from 'vue'
const files = require.context('.', true, /\.vue$/)

files.keys().forEach(key => {
    let component = files(key).default
    Vue.component(component.name, component)
})
```

### conf里放些配置性的静态内容,或者声明


### directives 这里主要是自定义了一个下拉刷新的指令，并在directives/index.js里注册为全局下拉刷新
```javascript
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
```
### filters 自已过滤？还是转换？ 主要给某一数据转换下
>
    # tree -L 2 src/filters/
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
        let origin = location.origin.indexOf("//sales") !== -1 ? "http://test1.com.cn" : "http://test2.com.cn"
        window.location.href = path&&path[0]==='/'?`${origin}${path}` : `${origin}/${path}`;
      } else {
        window.location.href = path
      }
  },
  }
}
```
### pages
写一个典型的页面的js逻辑
```javascript
import { getOrderDetail } from "@/api/freedrb"
import { Indicator } from "mint-ui"
import { Toast, resolveTimeout, rejectTimeout } from "@/global"
import weixin from "../Official-Accounts"
export default {
  name: "order-result",
  data() {
    return {
      title: "签到二维码",
      desc: "长按保存到手机相册",
      contentInfo: {
        realName: "",
        themeName: "",
        activityPriceDesc: "",
        amount: "",
        qrCodeUrl: ""
      },
      qrcode: "",
      showWeixin: false
    }
  },
  components:{
    weixin
  },
  mixins:[], // 局部的mixins的混入
  methods: { // 方法
    goBack() {
      if (!this.fromName || this.fromName === "pre-order") {
        this.$router.push({ name: "mineOrder" })
      } else {
        this.$router.go(-1)
      }
    },
    setOrderInfo(orderDetail){
      Object.assign(this.contentInfo, OrderDetail)
      this.showWeixin = Number(OrderDetail.subscibeWechat) === 0;
    },
    hidenWeixin(){
      this.showWeixin = false
    },
    fetchAllData() {
    }
  },
  mounted() {
    this.fetchAllData()
  },
  computed: { // 计算属性
    
  },
  deactivated() {// 可以用来清理些资源或者重置一些标志位

  }
  activated(){ // 对于路由 keepA-alive之后的 页面再次进入（激活）的时候触发的生命周期，可以刷新数据，对应的生命周期为deactivated

  },
  beforeRouteEnter(to, from, next) { // 来源的，参数的验证，甚至进入页面前可以先去请求数据，请求到需要的数据之后才next()
    let { orderNo } = {...to.params, ...to.query } // 对于相同的参数用query去覆盖params里的参数（主要是有参数可以直接修改url,好覆盖，能直接覆盖，方便调试 ^_^）
    // 首页判断参数是否合法
    if (orderNo) {  // 参数合法
      Indicator.open({ text: "查询中...", spinnerType: "snake" }) // loading
      Promise.all[getOrderDetail({ orderNo }), resolveTimeout(1)]// 至少延迟一秒，防止请求过快 loading 一闪秒消失
        .then([orderDetail,] => {  // 请求成功,进入页面
          next(vm => {
            vm.fromName = from.name || "" // 保存来源路由
            vm.setOrderInfo(orderDetail) // 设置数据
          })
        })
        .catch(err => {     // 请求失败
          Toast(err)
          if(!from.name){ // 没有前一个路由 直接进来的， 跳到首页
            next({name: "home", replace: true})
          } // 否则只提示，啥都不做
        }).finally(res => {
          Indicator.close()
        })
    } else {
        Toast("参数错误，请重试")
        if(!from.name){ // 没有前一个路由（直接进来）,跳到首页
            next({name: "home", replace: true})
        } // 否则只提示，啥都不做
    }
  },
  beforeRouteLeave(to, from, next) { // 离开路由前 可以做些清理
    /*
    if ((!this.fromName || this.fromName === "pre-order") && to.name!=="mineOrder") { // 对于当前页面，如果是直接进来或者从支付页面过来，不该返回上一个页面，而是回到订单列表
          this.$router.replace({ name: "mineOrder"})
        } else {
          next()
        }
    }
  */
  next()
}

```
### router
#### 全局钩子函数
```javascript
export const setRedirectRouter = (router) => {// 设置重定向页面，用来处理登录前强制跳转登录的情况,等登录完成后可以跳回来，或者记录路由跳转记录（用户行为分析)
  let redirectRoute = ''
  let { name, query, params } = Router.currentRoute;
  if (router) {
      if (typeof router === 'object') {
        ({ name, query, params } = router);
          redirectRoute = JSON.stringify({name, query, params})
      } else {
          redirectRoute = router
      }
  } else if (name) { // 如果有当前的路由就将当前路由取出来
      redirectRoute = JSON.stringify({name, query, params})
  } else { // 没有就直接保存当前页面的路径
      redirectRoute = location.href.substr(location.origin.length)
  }

  localStorage.redirectRoute = redirectRoute
  /* 
  // 后面可以在登录成功之后恢复
  let redirectRoute = JSON.parse(localStorage.redirectRoute || "") 
  if (redirectRoute) {
      if (typeof redirectRoute == "object") {
          route.replace(redirectRoute)
      } else if (typeof redirectRoute === "string") {
          route.replace({path: redirectRoute})
      }
  }
  */
}

export const historyRoute = (to, from) => { // 记录了之后， 对于各种情况导致的重定向登录页的时候，等登录完成后可以回过去,当对于路由被拦截对此重定向之后回失效，所以不做此用； 或者说 可以做用户的页面活动（浏览记录之类的)
    const maxRoute = 5 // 最多记录多少个路由
    const tempData = { // 将本次所有路由对象保存起来包括from, to
      name: to.name, params: to.params, query: to.query
    }
    let localRouter = JSON.parse(localStorage.routers || "[]") // 一开始的时候默认为空
    if (localRouter.length) { // 如果有记录了 做下处理
        if (localRouter[localRouter.length - 1].name === to.name) { // 上次保存的跟这一次保存的是同一个路由（处理用户的刷新问题)
            localRouter.pop(); // 对于这种情况 我选择用后面的覆盖之前的上次的路由 所以先将上次路由弹出去
        } else if (localRouter.length > maxRoute) { // 如果超过最大路由数, 先将最前面的弹出去
            localRouter.shift()
        }
    }
    if (!["agreement-detail"].includes(to.name)) { // 该页面是登录页的  协议页面 单独将该页面排除， 对于不想处理的页面可以来此添加
        localRouter.push(tempData)
    }
    localStorage.routers = JSON.stringify(localRouter);// 序列化回localStorage
}

router.beforeEach((to, from, next) => { // 此处的next里的回调不会被调用，但next可以用来重定向
    if (!checkIsLogined() && !["login", "logout"].includes(to.name)) { // 没有登录并且不是不是去特定页面（如登录页）的话就去登录
      setRedirectRouter(to)
      next({name: "login"}) // 跳去登录页
    } else { // 否则进入该页面
      next()
    }
})
router.afterEach((to) => {
    let { meta: { title = "" } = {} } = to;
    if (title) {
        document.title = title
    }
})
router.beforeResolve((to, from, next) => {
    // 该函数不能 next来重定向，传回调也没用，只能用来做一些记录之类的， 到了这里基本能确定该页面能进入了， 作用于跟afterEach 差不多，只是调用的时机不一样
    historyRoute(to, from) // 记录路由历史
    next()
})

// 访问统计，在路由加载完后发送该请求，　同时排除非线上环境以及刷新的统计
let isRefresh = sessionStorage.getItem("isRefresh");
window.isRefresh = isRefresh
router.onReady(() => {
    if (process.env.NODE_ENV == "production" && !isRefresh) {
        (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?919bghfb8043447f1e2dca1cdf6jb0c4";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
        sessionStorage.setItem("isRefresh", 1)
        })();
    }
    window.isRefresh = false;
})
```

#### 全局混入的页面路由钩子函数
```javascript
let resolveRouter = (to, from, next) => {
  if (["login", "perfect-userInfo", "logout"].includes(to.name)) { // 这几个页面不做任何处理 直接进入
      next((vm) => {
      vm.routerFrom = from.name // 在页面里记录下从哪个页面来， 此处有坑，比如在当前页面刷新下，那就该值就变成空了
      vm.currentRouteName = to.name // 顺便存下当前页面的路由名称, 这个值可以去router实例上获取 router.currentRoute.name
    })
  } else { // 对于别的页面至少是登录了
      Promise.all([refreshToken().catch(err => { throw { name: 'login' } }), // 刷新token 需不需要刷新在refreshToken函数里做, 刷新失败，抛出异常，让去重新登录
      new Promise((resolve, reject) => {
          if (getUserInfo().isActive) { // 虽然激活过  但是下面这个接口还是得调用一下，别的地方依赖于这个接口获取的别的信息，当前逻辑是无影响，但后面的能稍微快一点， checkIsActive是缓存过的 不会每次都去请求，可以放心
           checkIsActive() 
           resolve({ msg: "本地的缓存已经激活过了", isActive: true })
          } else {
            resolve(checkIsActive().then(res => {
               let { isActive } = res;
               setUserInfo({isActive})
               return res
           }).catch(err => { // 如果调用失败就  默认激活了吧 不然改成 reject({ name: 'perfect-userInfo' })
               return { msg: "本地的缓存已经激活过了", isActive: true }
           }))
          }
       })])
      .then(([token, {isActive = false} = {}]) => {
           if (isActive) { // 激活过了 就过
            let routes = JSON.parse(localStorage.routers || '[]')
              if (localStorage.redirectRoute) {
                if (routes.length && ['login', 'agent-area'].includes(routes[routes.length-1].name)) {
                  let redirectRoute = JSON.parse(localStorage.redirectRoute)
                  localStorage.removeItem('redirectRoute')
                  next(redirectRoute)
                } else {
                  next((vm) => {
                    vm.routerFrom = from.name // 在页面里记录下从哪个页面来， 此处有坑，比如在当前页面刷新下，那就该值就变成空了
                    vm.currentRouteName = to.name // 顺便存下当前页面的路由名称, 这个值可以去router实例上获取 router.currentRoute.name
                  })
                }
              } else {
                next((vm) => {
                  vm.routerFrom = from.name // 在页面里记录下从哪个页面来， 此处有坑，比如在当前页面刷新下，那就该值就变成空了
                  vm.currentRouteName = to.name // 顺便存下当前页面的路由名称, 这个值可以去router实例上获取 router.currentRoute.name
                })
              }
           } else { // 没有激活过 就跳去完善信息页面激活
              next({name: "perfect-userInfo", replace: true})
           }
       }).catch(err => { // 此处的异常 目前是来自于刷新token
           setRedirectRouter(to)
           next({name: err.name || 'login'})
       })
  }
}

export const shouldLoginMixin = {
  beforeRouteEnter(to, from, next) {
    resolveRouter(to, from, next)
  },
  beforeRouteLeave (to, from, next) { // 离开页面的时候记录下当前页面的滚动条的位置，好让下次进来滚动到上次记录的位置, 此处是记录在内存中强制刷新下，同样也会没有 所以有必要的话可以序列化到本地
  // document.documentElement.scrollTop
  from.meta.savedPosition = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
  next()
},
mounted() {
  this.isMounted = true;
  wx.hideOptionMenu() // 微信隐藏菜单
  setTimeout(() => { this.isMounted = false }, 0)
}
}
```
### store里就是vux数据

#### 一个store如下所示
```javascript
import { getUserNoticeRecordCount } from '@/api'
export default {
    namespaced: true, // 是否以模块来用
    state: { // state
        unReadMessageCount: 0
    },
    mutations: { // commit　－－　同步操作方法
       setCount(state, num) {
            state.unReadMessageCount = num || 0
       }
    },
    actions: { // dispatch -- 异步操作方法
        fetchUserNoticeRecordCount({ state, dispatch, commit }) {
            return getUserNoticeRecordCount().then(res => {
                commit('setCount', res)
                return res
            })
        }
    },
    getters: { // like computed
        unReadMessageCount(state) { // 有些属性太长，可以定义getters　好比 computed属性一样
            return state.unReadMessageCount
        }
    }
}
```

这是这些store自动导入的代码
```javascript
const files = require.context('./modules', false, /\.js$/)
const modules = {}

files.keys().forEach(key => {
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export default {
  namespaced: true,
  modules
}
```

### webpack 打包常用工具
#### DefinePlugin
编译的时候注入一些全局性的常量（值）,可以全局拿到的用来根据注入的不同判断环境（生产环境或开发环境）
```javascript
new webpack.DefinePlugin({
  PRODUCTION: JSON.stringify(true),
  VERSION: JSON.stringify("5fa3b9"),
  BROWSER_SUPPORTS_HTML5: true,
  TWO: "1+1",
  "typeof window": JSON.stringify("object")
})

// uglifyjs-webpack-plugin
// 用来混淆js以及过滤些无用的（注释，ｌｏｇ,debugger)
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
 new UglifyJsPlugin({
      uglifyOptions: {
        comments: false,
        compress: {
          warnings: false
        }
      },
      sourceMap: productionSourceMap,
      parallel: true
    }),
// extract-text-webpack-plugin
// 抽离css样式到单独的文件,防止将样式打包在js中引起页面样式加载错乱的现象
const ExtractTextPlugin = require('extract-text-webpack-plugin')
  new ExtractTextPlugin({
    filename: utils.assetsPath('css/[name].[contenthash].css'),
    allChunks: true
  })

  // optimize-css-assets-webpack-plugin
  // 压缩css
  const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
   new OptimizeCSSPlugin({
      cssProcessorOptions: productionSourceMap
        ? { safe: true, autoprefixer: false, map: { inline: false } }
        : { safe: true, autoprefixer: false }
    }),

// html-webpack-plugin

const HtmlWebpackPlugin = require('html-webpack-plugin')
    new HtmlWebpackPlugin({
      filename: config.build.index, // 生成的html文件名
      template: 'index.html',　//所使用的模板
      inject: true, // script注入的位置
      isProd: true,
      minify: { //　对html压缩的配置
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency', //注入　script的顺序
      serviceWorkerLoader: cdn　// 其他的一些变量（可以在模板里使用的变量，比如这里注入了几个ｃｄｎ引入的script
    })

    // 打包提取公共代码部分

      new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) { // node_modules里js单独打包，以及node_modules里的css和静态导入的ｃｓｓ单独打包
        let { resource } = module || {}
        // any required modules inside node_modules are extracted to vendor
        return (
          (resource &&/\.js$/.test(resource) && resource.indexOf(path.join(__dirname, '../node_modules')) === 0) 
          || 
           (/\.css$/.test(resource) || (resource &&resource.indexOf(path.join(__dirname, '../node_modules')) === 0) // 引入的css以及在node_modules里的单独打包
           )
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 2
    }),
  
// copy-webpack-plugin　静态资源的拷贝
const CopyWebpackPlugin = require('copy-webpack-plugin')
new CopyWebpackPlugin([
// {
//   from: path.resolve(__dirname, '../static'),
//   to: `${config.build.assetsRoot}`,
//   ignore: ['*.txt']
// },
{
  context: path.resolve(__dirname, '../static'),
  from: '*',
  to: config.build.assetsSubDirectory,
},
// {
//   from: path.resolve(__dirname, '../active'),
//   to: `${config.build.assetsSubDirectory}/active`,
//   ignore: ['.*']
// },
])

// zopfli-webpack-plugin , 这个插件gz和br都可以
// var ZopfliPlugin = require("zopfli-webpack-plugin");
//  new ZopfliPlugin({
//             asset: "[path].gz[query]",
//             algorithm: "zopfli",
//             test: /\.(js|html)$/,
//             threshold: 10240,
//             minRatio: 0.8
//         })
// 打包之后的文件压缩 zopfli-webpack-plugin 和 compression-webpack-plugin 选一个
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  const BrotliPlugin = require('brotli-webpack-plugin');  // brotli-gzip-webpack-plugin
  webpackConfig.plugins.push(
    new BrotliPlugin({
      asset: '[path].br[query]',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.build.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    })
  )

 // webpack-bundle-analyzer
// 打包文件依赖关系的分析(生成报告)
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
```

### 优化（减小必要资源大小，减少不必要的请求）
- webpack打包提取公共的代码（包括ｊｓ和css）, 一些不变的依赖直接cdn引入（vue vue-router xuex axios), 将常用的css　单独以类名的形式单独写出来　变成全局的样式, 一些ui库之类的按需引入；将node_modules里的依赖单独打包；
- 开启压缩混淆去掉注释（代码里估计有不少注释)
- 开启gzip，br(需要在https下，但压缩率更高--比gzip高17％左右)
- vue 的依赖直接用runtime版本，vue代码通过webpack的load转后已经变成render函数了无需vue去编译template　gzip之后能少个10k
- 路由懒加载( component: () => /* 对应组件 */import("@/pageView/login/login"))
- pwa
- 注意代码书写（高校、简洁），主要是合理处理异步请求，通过[local/session]Storage，内存(vuex)等存储，减少没必要的异步请求，没有先手顺序的异步合并（至少不要强行顺序依赖）

### 项目优化细节
- 打包提取公共的代码
- 全量引入的库　直接cdn，因为这些每次打包都不会变，版本也不常变，如vue vue-router xuex axios
- 按需引入的第三方库，包括lodash, 以及支持按需加载的ui库，感觉应该单独给每个库打个包，因为变化（其中一个库的引入增减不会影响到别的不变的库）[现实中没这么处理]，要是可以样式也应该同样处理，把不常变的统一打包，经常变的单独打包
- 对于某些只在特定的页面用的库不要全局直接cdn引入，比如极验证的js只在登录页面用到，那不应该全局(cdn)引入，因为别的页面都不需要它
- vue 通过vue-loader处理之后.vue的文件会被编译掉，然后直接引vue的runtime版本，　gzip之后将近能少个10k；　注意　最后的main.js里能可能会new Vue({})，这里vue-loader不会去出处理它，所以需要手动将　template:'<App/>'　改成render函数　render (h) {return h(App)}，　不然引runtime版本会有问题
- 路由懒加载( component: () => /* 对应组件 */import("@/pageView/login/login"))
- 开启压缩混淆去掉注释（代码里估计有不少注释)
- 开启gzip，br(需要在https(压缩率更高--比gzip高17％左右), 同时开启http2更好
- 加上静态资源的缓存（强缓存配合协商缓存）
- pwa
- 业务逻辑的优化，　比如防止重复请求，短期内使用缓存（内存的缓存，[session/local]Storage的缓存等）
- 合理利用钩子函数来做合理的请求，不用短时间内重复请求
- 高性能的js