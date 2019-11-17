import VNode from "../../vdom/vnode.js";
import { getValue } from "../../util/ObjectUtil.js";

export default function vForInit(vm, elm, parent, instructions) { //instructions的值就是v-for的值：比如 "(key) in list"
    //之前我们知道VNode还有一个data属性，这里我们就需要用到了。我们需要保存一下在instructions中引用了哪一个变量，比如list。那么就定义一个方法来解析出这个变量名。
    //这里我们多插一嘴，instructions这里可能不一定只有一种形式，还可能有很多的语法，但是我们讲不了，因为语法解析是一门专门的学科，如果我们在学校学过编译原理的话，要实现语法解析要写成千上万的代码。Vue有很大一部分代码就是在做这个编译。如果我们在学校里有这种学习经历的，可以尝试写一下JS的编译器。但是不会也没关系，跟算法也没关系。我们假设只支持这种固定的句型即指令式。（编译时只要符合正确的语法就行）

    let virtualNode = new VNode(vm, elm, [], '', getVirtualNodeData(instructions)[2], parent,  0) //nodeType我们设置成0，表示这个节点是虚拟的，没有意义

    //我们在VNode构造函数中早就设置了instructions属性，现在终于派上用场了。
    virtualNode.instructions = instructions;

    //然后得让父级把这个节点给删了。我们之前说了<li  v-for="(key) in list">姓名：{{key.name}}, 年龄{{key.age}}</li>是虚拟的，list有多少属性就相应的生成多少个真正的li，但是一开始的这个li是不会存在ul中的。
    parent.elm.removeChild(elm);
    //这里需要注意一个问题，比如<ul> (回车 )<li>xxx<li/>(回车)<ul>是有三个子节点的即[text, li, text]，而我们删除了li之后ul就只剩一个文本节点了。因此为了前后结构保持一致，我们再增加一个文本节点。其实没有什么意义
    parent.elm.appendChild(document.createTextNode(''));

    let resultSet = analysisInstructions(vm, instructions, elm, parent)
    console.log(virtualNode);
    return virtualNode;
}

function getVirtualNodeData(instructions) {
    let insSet = instructions.trim().split(' ');  //形式为 ["(key)", "in", "list"]
    if (insSet.length != 3 || insSet[1] != "in" && insSet[1] != 'of') {
        throw new Error("error");
    }

    return insSet;
}

function analysisInstructions(vm, instructions, elm, parent) {
    // console.log(elm.innerHTML);
    let insSet = getVirtualNodeData(instructions);
    console.log(insSet);
    let dataSet = getValue(vm._data, insSet[2]);

    if (!dataSet) {
        throw new Error("error");
    }

    let resultSet = [];
    for (let i = 0; i < dataSet.length; i++) {
 
        let tempDom = document.createElement(elm.nodeName);
        // console.log(tempDom);
        // console.log(elm.innerHTML);
        
        tempDom.innerHTML = elm.innerHTML;
        // console.log(tempDom);

        //下面就要用到我们老早就提到过的env属性了。
        let env = analysisKV(insSet[0], dataSet[i], i); //获取局部变量
        // console.log(env);
        tempDom.setAttribute('env', JSON.stringify(env)); //将变量设置为DOM属性
        // console.log(tempDom);
        parent.elm.appendChild(tempDom);

        // console.log(parent);

        resultSet.push(tempDom);
    }
    console.log(resultSet);
    return resultSet;
}

function analysisKV(instructions, value, index) {  //比如传入key或者带括号 (key),带括号的可以传入多个值并用逗号隔开比如(key, index)
    //首先我们要判断(key)有没有带括号

    if (/\([a-zA-Z0-9_$,]+\)/.test(instructions)) { //去除括号，比如(key) 变为 key，注意一定要在\(\)加转译字符，老师这里有错误没加，而且老师也没有加逗号。
        instructions = instructions.trim();
        instructions = instructions.substring(1, instructions.length - 1)
        // console.log(111);
    }
    let keys = instructions.split(",");
 
    if (keys.length == 0) {
        throw new Error("error")
    }
    let obj = {};

    if (keys.length >= 1) { //说明是(key)括号里只有一个值
        obj[keys[0].trim()] = value;
    }
    if (keys.length >=2) {
        obj[keys[1].trim()] = index;
    }

    return obj; //这个obj就是它的局部变量，key和index是该li的局部的变量，不同的li之间的值是不一样的。最后我们赋值给了env
}