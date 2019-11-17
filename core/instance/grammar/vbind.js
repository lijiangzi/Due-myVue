import { getValue, getEnvAttr } from "../../util/ObjectUtil.js";
import { generateCode, isTrue } from "../../util/code.js";

export function checkVBind(vm, vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    let attrNames = vnode.elm.getAttributeNames();
    for (let i = 0; i < attrNames.length; i++) {
        if (attrNames[i].indexOf('v-bind:') == 0 || attrNames[i].indexOf(':') == 0) { //表示该属性是以v-bind开头或者是它的缩写:开头
            vBind(vm, vnode, attrNames[i], vnode.elm.getAttribute(attrNames[i]))
        }
    }

}

function vBind(vm, vnode, name, value) {//传入的参数为vm, vnode, v-bind:src, imgSrc
    // console.log(value);
    let k = name.split(':')[1];
    if (/^{[\w\W]+}$/.test(value)) {
        let str = value.substring(1, value.length -1).trim(); //把v-bind:class="{red: obj.money > 2， blue: obj.money < 2}"的value拆分成"red:obj.money>2,blue:obj.money<2"这种形式，所以我们还需要以","逗号拆分
        let expressionList = str.split(',');  //[red:obj.money>2, blue:obj.money<2]

        //然后我们要解析表达式
        let result = analysisExpression(vm, vnode, expressionList);  //[red:obj.money>2, blue:obj.money<2]
        vnode.elm.setAttribute(k, result);
        console.log(result);
    
    } else {
        let v = getValue(vm._data, value);
        vnode.elm.setAttribute(k, v)
    }
}

function analysisExpression (vm, vnode, expressionList) {  //[red:obj.money>2, blue:obj.money<2]
    //首先获取当前环境的变量
    let attr = getEnvAttr(vm, vnode); //就是data对象，如果有v-for的话就加上v-for的env

    
    //判断表达式是否成立
    //类似于red: obj.money < 2 + 1 这种表达式是否成立，可以用编译原理做一个特别复杂的编译器，但我们显然是做不到的，那有没有一种比较简单的方式呢？借助eval创建一个执行环境。
    let envCode = generateCode(attr); //首先获取它的环境的所有的变量的代码表达式：见utils/code.js
    // console.log(envCode);
    //拼组result
    let result = "";
    for (let i = 0; i < expressionList.length; i ++) {
        let site = expressionList[i].indexOf(":"); //冒号左边是变量red，冒号右边是表达式 obj.money>2
        if (site > -1) { //说明有:冒号，比如red:obj.money>2
            var code = expressionList[i].substring(site + 1, expressionList[i].length ) //从:之后的位置开始截，比如得到code为obj.money>2
            //然后结合上面的环境声明代码，来验证这个表达式是否成立。
            if (isTrue(code, envCode)) {
                result += expressionList[i].substring(0, site) + ",";
            }
        } else { //说明没有冒号，比如写的是： v-bind:class="{red, blue:xxx}"，那么直接加上就行了
            result += expressionList[i] + ","; //因为可能有多个，所有我们加个逗号隔开，最后再去掉这个逗号就行了。
        }
    }
    if (result.length > 0) {
        result = result.substring(0, result.length - 1);
    }
    console.log(result);
    return result;


}