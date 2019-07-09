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

```