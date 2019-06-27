
### 比较优雅的处理vue单页应用history模式下的h5微信分享
问题描述：　微信h5页面会涉及到各种各样的自定义分享，设置微信分享时需要需要当前页面url先调用个后端接口，并拿到签名啥的一个对象，然后wx.config注册下在设置分享的信息才能成功，android和ios对这个页面路由变化的识别不同，虽然是单页应用，但history模式下,ios 只需要调用并wx.config一遍,但在安卓下需要每个页面都要重新注册wx.config，为了稍微统计的处理，需要在路由resolve值后拿url去后端调用接口来获取签名，　现在我能想到如下几种方案：
- 到页面（路由)所对应的组件里去做这件事，比如mounted里。优点：　只需要在需要分享的页面来做，但一般几乎每个页面都可以分享，只是没有定制化的只是分享个首页啥的（也就是变成了每个页面都要做这事，这也变成了缺点）
- 到router.afterEach(to=>{})里做这件事，　优点: 所有的都在这里统一做，那所有需要分享的　链接，描述，标题都得提前知道，没法请求个接口拿到的数据来做描述和标题等自定义信息

所以需要一种既能有默认执行的分享，又能把它屏蔽掉的，还能自定义分享的方式来应付各种场景
路由所对应的页面组件级别就有一个beforeRouteEnter　每次进入这个页面的时候都会触发，而且需要手动next（可以提供一个回调参数就是组件的vm实例，而且回调在mounted之后触发)，而且可以通过vue的mixins全局来混入一个全局的beforeRouteEnter　来专门做这个事情，　同时为了能够屏蔽它我需要把这个它混入成一个方法（对于方法，可以通过重定义一个相同的方法来屏蔽全局混入的方法），同时再混入几个方法来做分享的自定义
```javascript
// wxShareMixins.js
import wx from 'weixin-js-sdk'
import config from '@/conf/config'
import { getWXConfig } from '@/api/WXconfig'
import { isWX, isIos } from './tools'
/**
 *
 * @param {title} shareData 分享内容的标题
 * @param {desc} shareData 分享内容的描述/副标题
 * @param {link} shareData 分享页面的链接
 * @param {imgUrl} shareData 分享卡片的小图片
 * @param {type} shareData 分享类型,music、video或link，不填默认为link
 * @param {success:(){}} shareData // 用户点击了分享后执行的回调函数
 * @param {cancel:(){}} shareData // 用户取消分享后执行的回调函数
 */
const wxShare = (param) => {
    let referrer = window.localStorage.getItem('userId') || "";
    let {
        title = "sdfsf",
        desc = "dd",
        link = `${window.location.origin}/home?referrer=${referrer}`,
        type = "link",
        imgUrl = "http://sdfsf.com/upload/image/20180906/6929b166cdef4903ab15958fe7d0f784.jpg",
        success = () => {},
        cancel = () => {}
    } = param || {}
    let shareData = {
        title,
        desc,
        link,
        type,
        imgUrl,
        success,
        cancel
    }
    wx.showOptionMenu()
    // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口（即将废弃）
    wx.onMenuShareTimeline(shareData)
    // 获取“分享给朋友”按钮点击状态及自定义分享内容接口（即将废弃）
    wx.onMenuShareAppMessage(shareData)
    // 获取“分享到QQ”按钮点击状态及自定义分享内容接口（即将废弃）
    wx.onMenuShareQQ(shareData);
    // 获取“分享到QQ空间”按钮点击状态及自定义分享内容接口（即将废弃）
    wx.onMenuShareQZone(shareData);
}

/*
* 首先将微信config需要的参数调用接口异步和注册异步，用一个Promise连起来，方便使用
*
*/
const WXconfigPromise = () => {
  return new Promise((resolve, reject) => {
    getWXConfig({
      url: window.location.href.split('#')[0] // encodeURIComponent(window.location.href.split("#")[0])
    }).then((res) => {
      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: res.data.appId || config.appId, // 必填，公众号的唯一标识
        timestamp: res.data.timestamp, // 必填，生成签名的时间戳
        nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
        signature: res.data.signature, // 必填，签名
        jsApiList: res.data.jsApiList || ['onMenuShareTimeline', 'onMenuShareAppMessage', 'chooseWXPay'] // 必填，需要使用的JS接口列表
      })
      wx.ready(() => {
        resolve("OK")
      })
      wx.error(res => {
        reject(res)
      })
    }).catch(rej => {
      reject(new Error('获取微信配置失败'))
    })
  })
}

/*
这个方法主要是为了优化ios的分享注册流程,　ios的单页应用就算是history 模式只需要注册一次，后面直接设置分享就好了，所以是用来缓存ios的注册结果
*/
export const getWXConfigPromise = (() => {
    let wxConfigTemp = null // 用来保存ios　主要该注册异步处于pending的时候，返回之前pending中的Promise, 而不需要重复注册
    let wxConfigResult = null　//　由于ios只需要注册一次，所以这个是用来保存注册成功之后缓存成功的Promise
    return ()=>{
        if (isIos()) { // 是ios
            if (wxConfigResult) {// 之前成功过了
            return wxConfigResult
            } else if (wxConfigTemp) {// 之前处于pending, 直接返回上次pending的那个
            return wxConfigTemp
            } else { // 否则重新创建并缓存在内存中（存在变量里）
            wxConfigTemp = WXconfigPromise().then(res => {
                wxConfigResult = Promise.resolve(res) // 缓存结果
                wxConfigTemp = null // 成功清空零时的变量，下次直接用 resolve的结果
                return res
            }).catch(err => {
                wxConfigTemp = null // 失败了，清空变量，下次好再次重新创建
                throw err //对于失败的清空只是为了清空wxConfigTemp变量，错误还是要往后抛
            })
            return wxConfigTemp　// 创建完之后直接返回刚才创建的Promise
            }
        } else {　//　安卓就不在做这种了　因为history模式　router一变　它就需要重新注册， hash模式可以不用重新注册
            return WXconfigPromise()
        }
    }
})()

/*
  自定义分享的统一处理
*/
export const shareMixin = {
  methods: { // 混入几个跟分享相关的方法
    // 分享函数， to --> 进来的路由信息对象，from ---> 目标路由信息对象(当前页面路由) ,
    // 若有些页面 如子路由的父路由无需分享时，在那个页面的methods里写个 shareMixin来覆盖当前的函数混入，vm为当前页面组件的实例
    // 可以往vm上挂一个key为shareDataPromise的Promise（也就是可以将异步获取的信息）　会优先取这个，　没有的话会到当前路由对象的shareInfo上找
    shareMixin(to, from, vm) {
      // 自定义分享信息函数，需要从router里设置的对象(写在router/index.js里)，对象说明如下
      /* 路由对象item项说明
        {
          path: "/login", // 路径声明
          name: "login",  // 路由别名
          meta: {
              keepAlive: true, // 当前路由是否缓存(暂时不做缓存处理)
              title: "", // 当前页面写死的标题(页面自定义标题，若需要根据后端请求回来的数据来改标题就要在那个相应的回调里设置  document.title = title), 若没有设置 那就是用默认的
              shareInfo: { // 自定义分享信息，若需要根据异步数据来设置，则需要在 页面所对应的组件上挂载一个 Promise => {title,desc}  这样的
                  title: "欢迎来到微商夜大",
                  desc: "从今往后，微商夜大与您同行",
                  paramsKey: [‘productId’] //// 分享时具体页面的需要附带的参数声明，key 为对应路由的name，paramsKey为需要附加上的参数列表的参数key 分享需要从当前路由附加的参数 比如id
              }
          },
          component: () => // 对应组件
              import("@/pageView/login/login")
        },
      */
      if (isWX()) {
        return
      }

      const { path = '/home', meta: { shareInfo: { paramsKey = [], sharePath = path, ...others } = { } } = {} } = to
      let referrer = window.localStorage.getItem('userId') || ""
      let shareParams = { referrer }
      if (paramsKey.length) { // 需要分享，而且需要附带页面参数的部分
        let params = { ...vm.$route.query, ...vm.$route.params } // 目标路由的参数 对象
        let paramsObj = Object.entries(params).reduce((prevValue, [key, value]) => {
          // eslint-disable-next-line no-return-assign
          return paramsKey.includes(key) ? (prevValue[key] = value, prevValue) : prevValue
        }, {}) // 加需要附近的参数key value附加上去
        Object.assign(shareParams, paramsObj)
      }


      let shareParamsStr = Object.entries(shareParams).map(([key, value]) => value !== '' ? `${key}=${value}` : '').join('&')
      if(sharePath.startsWith('/')) { // 如果是相对路径的分享那就加上window.location.origin
        sharePath = `${window.location.origin}${sharePath}`
      }
      let link = `${sharePath}?${shareParamsStr}`
      let shareData = Promise.resolve({ ...others }) // 构造一个空的Promsie

      if (vm.shareDataPromise) {
        shareData = vm.shareDataPromise
      } // 对于指定的页面去取异步分享数据来替换默认的异步
      Promise.all([shareData, getWXConfigPromise()])
        .then(([shareRes, shareIsShow]) => {
          wxShare({ ...shareRes, link })
        })
    },
    replaceShareFun(options) { // 注册并设置分享
      return getWXConfigPromise()
        .then(() => {
          wxShare({ options })
        })
    },
    getWXConfigPromise() { // 注册wxconfig
      return getWXConfigPromise()
    },
    wxShare(options) {// 设置微信分享
      wxShare(options)
    }
  },
  beforeRouteEnter(to, from, next) {
      // 在改钩子函数里丢到next回到李做这个
    next(vm => {
       // 这是全局混入的分享注册方式
      vm.shareMixin(to, from, vm)
    })
  }
}
```



## 使用说明
举个栗子(以下都是路由所对应的路由组件),很多页面的分享标题和

```javascript
/* 路由对象item项说明
    {
        path: "/login", // 路径声明
        name: "login",  // 路由别名
        meta: {
            keepAlive: true, // 当前路由是否缓存(暂时不做缓存处理)
            title: "", // 当前页面写死的标题(页面自定义标题，若需要根据后端请求回来的数据来改标题就要在那个相应的回调里设置  document.title = title), 若没有设置 那就是用默认的
            shareInfo: { // 自定义分享信息，若需要根据异步数据来设置，则需要在 页面所对应的组件上挂载一个 Promise => {title,desc}  这样的
                title: "欢迎来到微商夜大",
                desc: "从今往后，微商夜大与您同行",
                paramsKey: [‘productId’] //// 分享时具体页面的需要附带的参数声明，key 为对应路由的name，paramsKey为需要附加上的参数列表的参数key 分享需要从当前路由附加的参数 比如id
            }
        },
        component: () => // 对应组件
            import("@/pageView/login/login")
    },
*/
export default {
  name: 'test',
  mounted() {
      // 可以往当前的this实例上挂一个shareDataPromise的Promise,有这个会优先取这个
      this.shareDataPromise = Promise.resolve({title: "test", desc: "描述的文字", imgUrl: "分享的图标地址"})

  },
  methods: {
      // 声明一个空的函数，那就是屏蔽了之前的全局混入的方法，
      // 重写这个方便可以自定义方法，让全局混入的beforeRouteEnter自动调用
      // 可以屏蔽，之后在mounted自定义
      shareMixin(to, from, vm){}

  }
}
```

### 知识点，
混入可以复用代码，混入合并规则，现将涉及合并的假设成一个数组，便于理解记忆　[全局混入，...[局部混入（以数组的形式混入多个mixin]，　组件]
- 对于[对象属性（包括数据，methods、components 和 directives）]相同的key 越往后的来覆盖前面的
- 对于（同名）钩子函数将合并为一个数组，越往前的越先调用
  
慎用全局混入，因为所有的混入将影响所有的组件，除非要用的就是这个副作用；局部混入或许更合适来复用小部分组件的代码复用