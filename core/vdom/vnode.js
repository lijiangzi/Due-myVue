
export default class VNode {
    //tag为节点类型，比如DIV SPAN 文本节点#Text； elm为对应的真实节点； children为当前节点的子节点; text为当前虚拟节点的文本; 
    //data为VNodeData，暂时保留，暂无意义; parent: 父级节点；nodeType：节点类型
    //我们通常在工作中会设置一个像data这样的预留字段，
    constructor(tag, elm, children, text, data, parent, nodeType) {   
        this.tag = tag;
        this.elm = elm;
        this.children = children;
        this.text = text;
        this.data = data;
        this.parent = parent;
        this.nodeType = nodeType;

        this.env = {}; //当前节点的环境变量，用来存放自己申明的变量，然后让所有的子节点去继承
        this.instructions = null; //存放指令(用处不是特别大)
        this.template = []; //当前节点涉及到的模板，也是预留的，可能用不到，那么就删了。

        //然后我们要来实现虚拟DOm树和真实DOM一一对应
    }
}