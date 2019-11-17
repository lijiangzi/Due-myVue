export function getValue(obj, name) {//{ {{key}}除了这种形式，还可能key本身就是一个对象，因此是： {{obj.a}} 
    if (!obj) {
        return obj
    }

    let nameList = name.split('.');  //可以用递归，也可以用for循环。

    let temp = obj;
    for (let i = 0; i < nameList.length; i++) {

        if (temp[nameList[i]]) {
            temp = temp[nameList[i]]
        } else {
            return undefined;
        }
    }

    return temp;
}

//比如： _data = {content: 'ljz', description: '真帅', obj: {x:1, y: 2}}
//当我们传入obj为_data,prop为content时，好办，直接_data[content] = value没问题，但是如果prop为obj.x呢？我们直接_data[obj.x] = value肯定就是错的
//因此我们需要封装一个setValue来处理。跟getValue很像。 
export function setValue (obj, data, value) { //哪个对象，哪个属性，值是什么。比如_data, obj.x, 3 
    if (!obj) {
        return obj;
    }

    let attrList = data.split('.');  //比如 [obj, x]
    let temp = obj;

    for(let i = 0; i < attrList.length - 1; i++) { //区别就在于，我们不需要找到最后一层，我们只需要找到_data[obj]。比如这里我们找到temp = _data[obj]
        if(temp[attrList[i]]) {
            temp = temp[attrList[i]]
        } else {
            return;
        }
    }

    if(temp[attrList[attrList.length -1]] != null) {
        temp[attrList[attrList.length -1]] = value;
    } 
}

//
export function mergeAttr (obj1, obj2) {
    if (obj1 == null) {
        return clone(obj2);
    }
    if (obj2 == null) {
        return clone(obj1);
    }
    let result = {};
    let obj1Attrs = Object.getOwnPropertyNames(obj1);
    var obj2Attrs = Object.getOwnPropertyNames(obj2);

    for (var i = 0; i < obj1Attrs.length; i ++) {
        result[obj1Attrs[i]] = obj1[obj1Attrs[i]]
    }
    for (var i = 0; i < obj2Attrs.length; i ++) {
        result[obj2Attrs[i]] = obj2[obj2Attrs[i]]
    }

    return result;
}

// export function easyClone (obj) { //这种写法无法合并代理对象vm_data
//     JSON.parse(JSON.stringify(obj))
// }

function clone (obj) {
    if (obj instanceof Array) {
        return cloneArray(obj)
    }  else if (obj instanceof Object) {
        return cloneObject(obj)
    } else {
        return obj;
    }
}

function cloneObject (obj) {
    let result = {};
    let names = Object.getOwnPropertyNames(obj); //即使是代理属性也能获取到
    for (let i = 0; i < names.length; i ++) {
        result[names[i]] = clone(obj[names[i]])
    }

    return result;
}

function cloneArray (obj) {
    let result = new Array(obj.length);
    for (var i = 0; i < obj.length; i ++) {
        result[i] = clone(obj[i])
    }

    return result;
}

//
export function getEnvAttr (vm, vnode) {
    let result = mergeAttr(vm._data, vnode.env);
    result = mergeAttr(result, vm._computed);

    return result;
}
