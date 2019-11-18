import { getValue } from "../../util/ObjectUtil.js";

export function checkVOn (vm, vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    //还是一样，先判断有没有v-on或者@属性
    let attrNames = vnode.elm.getAttributeNames();
    for (let i = 0; i < attrNames.length; i ++) {
        if (attrNames[i].indexOf('v-on:') == 0 || attrNames[i].indexOf('@:') == 0) {
            von(vm, vnode, attrNames[i].split(":")[1], vnode.elm.getAttribute(attrNames[i]));
        }
    }

    
}

function von (vm, vnode, eventName, eventFuncName) {
    console.log(eventName, eventFuncName);
    console.log(vm._methods);
    let eventFunc = getValue(vm._methods, eventFuncName);
    console.log(eventFunc);
    if (eventFunc) {
        // vnode.elm.addEventListener(eventName, eventFunc) 注意，如果我们直接这样绑定事件函数，this指向就不会永远指向vm实例。解决的办法也很简单，我们再经过一层函数的包装就行了。
        vnode.elm.addEventListener(eventName, proxyEvecute(vm, eventFunc))
    }
}

function proxyEvecute (vm, eventFunc) {
    return function () {
        eventFunc.call(vm)
    }
}