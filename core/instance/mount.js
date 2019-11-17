//初始化vm并挂载
//具体的挂载过程需要一些具体的算法，比如遍历DOM节点然后变成一个虚拟DOM树
import VNode from '../vdom/vnode.js'
import { prepareRender, getTemplate2Vnode, getVnode2Template, getVnodeByTemplate, clearMap } from './render.js';
import vmodel from './grammar/vmodel.js';
import vForInit from './grammar/vfor.js';
import { mergeAttr } from '../util/ObjectUtil.js';


//下面的initMount方法完全是为了实现，在vue中，可以先不挂载el，vue对象创建之后，再通过vm.$mount(el)进行挂载。
//不是什么很高大上的知识点
export function initMount() {
    Due.prototype.$mount = function (el) {
        let vm = this;
        let rootDom = document.getElementById(el);
        mount(vm, rootDom)
    }

}

export default function mount(vm, elm) { //vm实例，elm为真实DOM节点
    console.log('开始挂载');
    vm._vnode = constructVNode(vm, elm, null) //根节点没有父级节点，所以我们传入null

    //进行预备渲染，什么意思呢？因为data中的数据，可能不止一个地方用到了即{{data}}，
    //那么为了找到它，我们总不可能把整个DOM都遍历一遍，那性能也太差了
    //因此我们要建立渲染索引，通过模板找vnode，通过vnode找模板。这就是预备渲染要做的事情。
    //你会发现框架的底层都是在围绕着各种算法。
    prepareRender(vm, vm._vnode)
    console.log('template2vnode: ', getTemplate2Vnode());
    console.log('vnode2template: ', getVnode2Template());
}

function constructVNode(vm, elm, parent) {


    //建立虚拟DOM，需要用到算法： 深度优先搜索

    let vnode = analysisAttr(vm, elm, parent);  //要创建返回的vnode,如果有v-for这样的属性，就返回相关的虚拟DOM
    //如果没有v-for指令，那么上面的vnode就是vnode，我们就进行后续的正常的节点创建
    if (vnode == null) {
        let children = [];
        let text = getNodeText(elm); //因为我们也不确定节点当中有没有文本内容，所以借用一个方法判断一下
        //文本和文本节点不是一个概念。只有文本节点才有文本，标签节点只有文本节点子节点，没有文本
        //是文本节点即nodeType为3，我们则获取它的文本内容，否则返回空串''
        let data = null; //暂时用不到
        let nodeType = elm.nodeType;
        let tag = elm.nodeName;

        vnode = new VNode(tag, elm, children, text, data, parent, nodeType);

        //然后我们增加：
        if (elm.nodeType == 1 && elm.getAttribute('env')) {
            // console.log(JSON.parse(elm.getAttribute('env')));
            vnode.env = mergeAttr(vnode.env, JSON.parse(elm.getAttribute('env')));  //它本身的参数加上标签上的参数，比如说 <li v-for=xxx> <p v-for=xx> v-for里又有v-for，因此p标签里的属性既能访问到p身上的数据，又能访问到上一级的属性。因此我们要来一个env的合并。
            //我们在utils里定义mergeAttr方法
            // console.log(vnode.env);
        } else {
            vnode.env = mergeAttr(vnode.env, parent ? parent.env : '')
        }
    }


    let childs = vnode.nodeType == 0 ? vnode.parent.elm.childNodes : vnode.elm.childNodes; //原生DOm的方法,获取所有的子节点
    // console.log(childs);

    for (var i = 0; i < childs.length; i++) {
        //递归，调用的是constructVNode方法本身，这就是深度优先搜索，自己有多少个孩子，我就循环遍历多少遍。
        let childNodes = constructVNode(vm, childs[i], vnode);
        if (childNodes instanceof VNode) { //返回单一节点的时候
            vnode.children.push(childNodes)
        } else { //返回节点数组的时候，后面我们使用v-for的时候会用到
            vnode.children = vnode.childNodes.concat(childNodes)
        }
    }

    return vnode;
}


function getNodeText(elm) {
    if (elm.nodeType == 3) {
        return elm.nodeValue;
    } else {
        return ''
    }
}

function analysisAttr(vm, elm, parent) {
    if (elm.nodeType == 1) {
        let attrNames = elm.getAttributeNames();

        if (attrNames.indexOf('v-model') > -1) {
            vmodel(vm, elm, elm.getAttribute('v-model'))
        }

        if (attrNames.indexOf('v-for') > -1) {
            return vForInit(vm, elm, parent, elm.getAttribute('v-for'))
        }

    }
}

//当数组更新，再次构建

export function rebuild (vm, template) {
    // console.log(template);
    let virtualNode = getVnodeByTemplate(template);
    // console.log(virtualNode);
    for (let i = 0; i < virtualNode.length; i ++) {
        virtualNode[i].parent.elm.innerHTML = '';  //相当于把原来list生成的节点干掉
        virtualNode[i].parent.elm.appendChild(virtualNode[i].elm);

        let result = constructVNode(vm, virtualNode[i].elm, virtualNode[i].parent);
        console.log(result);
        virtualNode[i].parent.children = [result];

        clearMap(); //之前的map索引已经有问题了，因此我们重新建立映射。

        prepareRender(vm, vm._vnode) //注意这里的性能是非常高的，因为预备渲染不会动真实的DOM。这里prepareRender里又要增加一步对虚拟节点的操作即我们之前把虚拟节点的nodeType设为了0
    }
}