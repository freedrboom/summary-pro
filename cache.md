### 利用闭包在内存中缓存数据
对于前端单页应用，有时需要在内存里开一个缓存容器（对象）并对其有相应的操作，当然有了状态管理库之后貌似不需要了，直接用状态管理就行
```javascript
const allCache = {}
const createMemoryCaches = () => {
    const uniqueKey = Symbol()
    allCache[uniqueKey] = {}
    const setItem = (key, value) => {
        return allCache[uniqueKey][key] = value
    }
    const removeItem = (key) => {
        allCache[uniqueKey][key] = null
    }
    const getItem = (key) => {
        return allCache[uniqueKey][key] || null;
    }
    const clearAll = () => {
        allCache[uniqueKey] = {}
    }
    return {
        setItem,
        removeItem,
        getItem,
        clearAll
    }
}
// 实例化一个缓存容器（对象）
export const cacheInMemory = createMemoryCaches()


// 缓存一个Promise，同时也可以防止重复调用, 比如请求接口 getUserInfo();getUserInfo();这样连续调用两次，应该防止请求两次
const cachePromise = (PrmiseFun, initValue = () => null, setStore = () => null) => {
    // initValue　提供一个函数来获取初始值，比如之前缓存过了　后面已经不需要再做异步处理了，直接返回之前的数据就好的
    // setStore　同时提供了一个用来单独对异步成功之后做处理的回调，比如请求成功之后想把它缓存到本地，　好让下次直接取本地

    let inited = initValue()
    if (inited) { // 要是非空 那就是说明initValue　函数提供了值，表示无需再后面的异步处理了
        inited = Promise.resolve(inited)
    }
    let temp = inited;
    let result = inited;// 最近这次的结果缓存
     return (...args) => { // 要是最后一个参数是true, 那就是需要无视缓存，重新执行后面的异步
         let isReset = args.pop() || false
         if (isReset) {
            temp = null;
            result = null;
         }
      let { token } = getUserInfo();
      if (!token) {// 根据业务，所有接口都需要先登录，　要是不需要可以直接删除
        return Promise.reject(new Error("no login"))
      } else if (result) { // 要是之前缓存过结果，那就是直接返回，上面isReset = true　的情况下　会清空这个标记
          return result;
      } else if (temp) { // 要是之前没缓存过异步结果，那就看下之前不是创建过而且还在进行的该异步，这样用来防止短时间内重复调用，上面isReset = true　的情况下　会清空这个标记
        return temp
      } else { // 之前没缓存过异步结果，也没缓存过正在处理的异步，那就调用那个来创建异步，　并把它缓存到临时变量里　好下次再这次异步没resolved之前，直接返回这个异步
        temp = PrmiseFun(...args).then(res => {
          result = Promise.resolve(res);// 成功之后
          temp = null;
          setStore(res)
            return res
          }).catch(err => {
            temp = null;
            throw err;
          })
          return temp;
      }
    }
}

```