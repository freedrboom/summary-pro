### 微信ios对于图片长安出不来识别二维码问题
有很多问题能导致这个，比如position: absolute;
#### 解决方案
- 用 window.location.herf来代替this.$router.push 跳转
```
    window.location.href = `/share?themeId=${this.productId.themeId}`
    this.$router.push({name:"share",query:{themeId:this.productId.themeId}})
```
- 在对应的页面加个路由处理
```
beforeRouteEnter(to, from, next) {
    const location = global.location;
    const u = navigator.userAgent;
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
    if (isiOS && to.path !== location.pathname) {
        // 此处不能使用location.replace
        location.assign(to.fullPath)
    } else {
        next()
    }
}
```
- 前面两种对单页应用的破坏性非常大，如此强制刷新不太好,可以用第三种来解决这个问题 vue-router mode由 "history" ==> "hash",

### 写一个典型的页面的js逻辑
```
import { getOrderDetail } from "@/api/freedrb"
import { Indicator } from "mint-ui"
import { Toast, resolveTimeout, rejectTimeout } from "@/global"
import weixin from "../Official-Accounts"
export default {
  name: "order-result",
  data() {
    return {
      title: "签到二维码",
      desc:
        "长按保存到手机相册 开课现场工作人员扫码 入场即可 (非工作人员扫码无法验证)",
      contentList: [
        ["姓名", ""],
        ["报名课程", ""],
        ["线下开课时间", ""],
        ["金额", ""],
        ["票数", 1]
      ],
      qrcode: "",
      showWeixin: false
    }
  },
  components:{
    weixin
  },
  methods: {
    goBack() {
      if (!this.fromName || this.fromName === "pre-order") {
        this.$router.push({ name: "mineOrder" })
      } else {
        this.$router.go(-1)
      }
    },
    setOrderInfo(orderDetail){
       let {
            realName,
            themeName,
            activityAddress,
            activityStartTime,
            activityEndTime,
            activityPriceDesc,
            amount,
            qrCodeUrl
          } = orderDetail
          this.contentList[0][1] = realName
          this.contentList[1][1] = themeName
          this.contentList[2][1] = `${activityAddress}<${activityStartTime}-${activityEndTime}>`
          this.contentList[3][1] = activityPriceDesc
          this.contentList[4][1] = amount
          this.qrcode = qrCodeUrl
          this.showWeixin = Number(orderDetail.subscibeWechat) === 0;
    },
    hidenWeixin(){
      this.showWeixin = false
    },
    fetchOrderInfo() {
    }
  },
  mounted() {
    this.fetchOrderInfo()
  },
  computed: {},
  beforeRouteEnter(to, from, next) {
    let { orderNo } = {
      ...to.params,
      ...to.query
    }
    // 首页判断参数是否合法
    if (orderNo) {  // 参数合法
       Indicator.open({
          text: "查询中...",
          spinnerType: "snake"
        }) // loading
      Promise.all[getOrderDetail({ orderNo }), resolveTimeout(1)]// 至少延迟一秒，防止请求过快 loading 一闪秒消失
        .then([orderDetail,] => {  // 请求成功,进入页面
         next(vm => {
        vm.fromName = from.name || "" // 保存来源路由
        vm.setOrderInfo(orderDetail) // 设置数据
        Indicator.close()
      })
        })
        .catch(err => {     // 请求失败
          Indicator.close()
          Toast(err)
          if(!from.name){ // 没有前一个路由 直接进来的， 跳到首页
            next({name: "home", replace: true})
          } // 否则只提示，啥都不做
        })
    } else {
        Toast("参数错误，请重试")
        if(!from.name){ // 没有前一个路由（直接进来）,跳到首页
            next({name: "home", replace: true})
        } // 否则只提示，啥都不做
    }
  },
  beforeRouteLeave(to, from, next) {
  if ((!this.fromName || this.fromName === "pre-order") && to.name!=="mineOrder") { // 对于当前页面，如果是直接进来或者从支付页面过来，不该返回上一个页面，而是回到订单列表
        this.$router.replace({ name: "mineOrder"})
      } else {
        next()
      }
  }
}

```