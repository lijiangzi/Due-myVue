// 给Due添加初始化方法
//我们要做的有： 初始化data  初始化created方法  初始化methods   初始化computed  初始化el并挂载

import Due from './index.js';
import constructProxy from './proxy.js';

let uid = 0; //每个vm实例都有一个独一无二的id值

export  function initMixIn (Due) {
    Due.prototype._init = function (options) { //定义在Due构造函数的原型上，这样我们在new Due()时，this._init()就能被执行。

        const vm = this; //vm（visual model虚拟模块）指向Due实例
        vm.uid = uid++; //这样每个vm的uid都不会重复
        vm.isDue = true;  //定义是不是Due对象

        // 初始化data
        if(options && options.data) { //首先options和options得存在
            vm._data = constructProxy(vm, options.data, '');
            
        }
    }
}