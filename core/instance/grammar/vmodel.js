import { setValue } from "../../util/ObjectUtil.js"

export default function vmodel (vm, elm, data) { //vm实例，对哪个元素进行监听，跟哪个值进行绑定
    elm.onchange = function (event) {
        setValue(vm._data, data, elm.value)
    }

}

// function setValue (obj, prop, value) { //哪个对象，哪个属性，值是什么
//     if (!obj) {
//         return obj;
//     }

//     let attrList = data.split('.');
//     let temp = obj;

//     for(let i = 0; i < attrList.length - 1; i++) { //区别就在于，我们不需要找到最后一层，比如 obj:{ a: { b: {c: xxx}}} ，我们传入obj, a.b.c, xxx2 我们可以通过obj.a.b.c获取到c的值xxx，即obj[a][b][c]

//     }
// }