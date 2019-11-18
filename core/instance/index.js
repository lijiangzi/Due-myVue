// 真正的Due

import {initMixin} from './init.js' //混入一个初始化方法
import {renderMixin} from './render.js' //混入一个render方法


function Due (options) {
    this._init(options);
    if (this._created != null) {
        this._created.call(this)
    }
    this.render()
}

initMixin(Due) //初始化Due
renderMixin(Due)
export default Due;