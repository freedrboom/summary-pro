### 本地用户信息管理

一般应用都会涉及到本地信息管理，比如用户信息，经常登录接口会返回常用的用户信息，但某些场景，需要将别的接口里的某几个字段也顺便存进去，需要保存的返回数据格式不一样，需要手动的合并数据并保存；另外有时会碰到接口登录（刷新token)接口的数据结构会变, 考虑到之前存进去的和之后改数据结构之后的逻辑兼容，有时需要手动管理本地存储的某些信息；而且可能经常操作，可以适当的优化，因此把本地数据（用户信息）单独拉出来写成一个模块来管理

``` javascript
// localUser.js
let localUserInfo = null; // 在内存里存一份用户信息对象，下次获取的时候无需再从本地JSON.parse
/* eslint-disable camelcase */
let set_userInfo_or_relogin = ({userAccessToken = {}, userInfo = {}, userRoles = [], ...reset} = {}) => {
    try {
            // 接口返回的数据可能是一层套一层，有些数据需要手动打平，又需要考虑别的数据的设置进来的合并
        let tempUser = localUserInfo || get_userInfo_or_relogin();// 先查看内存有没有，没有从本地拿
        if (userRoles.length) {　// 角色是一个数组，要是有直接替换，这个根据业务来处理
            tempUser.userRoles = userRoles;
        }
        localUserInfo　＝　Object.assign({}, tempUser, { ...userAccessToken, ...userInfo, ...reset })
        localStorage.userInfo = JSON.stringify(localUserInfo)
    } catch (e) {

    }
}
let get_local_userInfo_or_throw = () => {// 拿到本地信息，顺便验证下数据，比如有没有uid
    let tempUserInfo = JSON.parse(localStorage.userInfo || "{}");
    if (tempUserInfo.uid) {
        localUserInfo = tempUserInfo
        return localUserInfo
    } else {
        throw new Error("请重新登录")
    }
}

let get_userInfo_or_relogin = () => {// 拿本地信息或者重新登录
    try {
        return localUserInfo || (localUserInfo = get_local_userInfo_or_throw());
    } catch (e) {
        localStorage.clear()
        location.href = `${location.origin}/login`
    }
}

export const checkIsLogined = () => { // 检查下是否登录过
    let tempUserInfo = JSON.parse(localStorage.userInfo || "{}");
    if (tempUserInfo.uid) {
        localUserInfo = tempUserInfo
    }
    return !!(localUserInfo || tempUserInfo.uid)
}

export const tryGetToken = () => {
    let { token } = localUserInfo || JSON.parse(localStorage.userInfo || "{}");
    return token
}

export {// 重新命名导出
    get_userInfo_or_relogin as getUserInfo,　
    set_userInfo_or_relogin as setUserInfo
}

```