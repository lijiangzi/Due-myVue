// 真正的Due

import {initMixIn} from './init.js' //混入一个初始化方法

function Due (options) {
    this._init(options)
}

initMixIn(Due) //初始化Due
export default Due;