import { getValue } from "../util/ObjectUtil.js"

//下面是完成预备渲染的一系列代码
let template2Vnode = new Map()
let vnode2Template = new Map()

export function prepareRender(vm, vnode) {
    if (vnode == null) {
        return
    }
    analysisAttr(vm, vnode)
    if (vnode.nodeType == 3) { //表示是一个文本节点
        analysisTemplateString(vnode)
    }
    if (vnode.nodeType == 1) { //说明是一个标签节点，那么它可能又有文本节点子节点，因为马上想到递归
        for (let i = 0; i < vnode.children.length; i++) {
            prepareRender(vm, vnode.children[i])
        }
    }
}

function analysisTemplateString(vnode) {
    // console.log(vnode.text);
    var templateStrList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);

    for (let i = 0; templateStrList && i < templateStrList.length; i++) { //注意得加一步判断，因为没有{{}}的文本节点返回的是null
        // console.log(templateStrList[i]);
        setTemplate2Vnode(templateStrList[i], vnode);
        setVnode2Template(templateStrList[i], vnode)
    }
}

function setTemplate2Vnode(template, vnode) {

    var templateName = getTemplateName(template);


    let vnodeSet = template2Vnode.get(templateName);
    if (!vnodeSet) { //如果不存在，说明是第一次有该变量，那么我们建立一个它的包含它的vnode的集合即数组
        template2Vnode.set(templateName, [vnode]) //注意，数组！
    } else { //说明之前已经有了一个该变量，那么继续将它的对应的vnode推入到数组中
        vnodeSet.push(vnode)
    }
}

function setVnode2Template(template, vnode) {
    var templateSet = vnode2Template.get(vnode)
    // console.log(templateSet);
    if (!templateSet) {
        vnode2Template.set(vnode, [getTemplateName(template)]);
    } else {
        templateSet.push(getTemplateName(template))
    }
}

function getTemplateName(template) {
    // 先判断template是否有花括号，如果有则解掉，如果没有则返回
    var len = template.length;
    if (template.substring(0, 2) == '{{' && template.substring(len - 2, len) == "}}") {
        return template.substring(2, len - 2)
    } else {
        return template;
    }
}

// 最后再暴露一个获取map的方法：

export function getTemplate2Vnode() {
    return template2Vnode
}

export function getVnode2Template() {
    return vnode2Template
}

//下面是render函数的一系列代码

export function renderMixin(Due) {
    Due.prototype.render = function () {
        renderNode(this, this._vnode)
    }
}

//我们要render的，自然是vnode了即虚拟DOM的根节点
//我们要把模板字符串渲染成对象的data值。还是一样，只有文本节点才可能有模板字符串，其他的我们不要管。
//诶我们之前这么做，好像有点优先的样子了。
//当然啦还是老规矩，标签节点可能含有文本节点子节点，因此别忘了递归。
//我们遍历树形结构的时候到处用的都是递归。

export function renderNode(vm, vnode) { //将模板变量渲染成真正的数据
    if (vnode.nodeType == 3) {
        let templates = vnode2Template.get(vnode);  //获取到的含有的模板变量数组。比如['content', 'description']当然啦如果是纯文本自然返回的就是空了。
        if (templates) {
            // console.log(templates);
            let result = vnode.text;  //vnode的text值是不变的比如 '你好，{{content}}, {{description}}'
            // 既然是数组那么自然的我们要遍历。
            for (let i = 0; i < templates.length; i++) {
                //我们要找出模板变量对应的data值
                //注意：重点：{{key}}对应的不只是data对象当中的值，还可以来自于标签，比如 <li v-for='key in list'>{{key}}</li>,那么我们去data去找是不对的，尽管list也是data的值，那么key终究也是存在于data中的，但是我们如果想要在data中找出无疑增加了难度。直接从它的标签属性list找不是更快更方便吗？因此这种情况我们需要预存一下变量，这样vm.env就起作用了。因此我们判断{{key}}的key值还需要在vm.env中找
                let templateValue = getTemplateValue([vm._data, vm.env], templates[i]);
                // console.log(templateValue);
                // 拿出了它的值，我们要来替换：
                if (templateValue) {
                    result = result.replace('{{' + templates[i] + '}}', templateValue)
                }

                vnode.elm.nodeValue = result
            }
        }

    } else if (vnode.nodeType == 1 && vnode.tag == "INPUT") {
        let templates = vnode2Template.get(vnode);  //一般input只会绑定一个v-model模板变量

        if (templates) {
            for(let i = 0; i < templates.length; i ++) {
                let templateValue = getTemplateValue([vm._data, vm.env], templates[i])
    
                if (templateValue) {
                    vnode.elm.value = templateValue;
                }
            }
        }
    }
    else {
        for (let i = 0; i < vnode.children.length; i++) {
            renderNode(vm, vnode.children[i])
        }
    }
}

function getTemplateValue(objs, templateName) {
    // console.log(objs);
    for (let i = 0; i < objs.length; i++) {
        // console.log(objs[i]);
        let temp = getValue(objs[i], templateName);
        if (temp) {
            return temp;
        }
    }
    return null;
}

export function renderData(vm, data) {
    let vnodes = template2Vnode.get(data)

    if (vnodes) {
        for (let i = 0; i < vnodes.length; i++) {

            renderNode(vm, vnodes[i])
        }
    }
}

function analysisAttr(vm, vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    let attrNames = vnode.elm.getAttributeNames();
    if (attrNames.indexOf('v-model') > -1) {
        setTemplate2Vnode(vnode.elm.getAttribute('v-model'), vnode);
        setVnode2Template(vnode.elm.getAttribute('v-model'), vnode);
    }
}