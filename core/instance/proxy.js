// 实现data代理
// 我们要知道哪个属性别修改了，我们才能对页面上的内容进行更新；
// 所以我们必须先能够捕获修改的这个事件；但是我们知道有鼠标事件、有键盘事件等，但是还没有听说JS有监听对象改变的是事件
// 所以我们需要用代理的方式来实现监听属性修改.(主要用到Objec.defineProperty)

function constructObjectProxy(vm, obj, namespace) {
    let proxyObj = {}; //我们要将obj的每个属性都相应的实现一个get和set方法，然后保存在proxyObj中

    for (let prop in obj) {
        console.log(prop);
        Object.defineProperty(proxyObj, prop, {
            configurable: true,
            get() {
                return obj[prop]
            },
            set(value) {
                console.log(getNameSpace(namespace, prop));
                obj[prop] = value;
            }
        })

        //vue还做了一步优化，就是data值，vm可以直接获取和设置，因此我们也来实现一下：其实很简单：
        // 只需将vm也设为代理对象就行了
        Object.defineProperty(vm, prop, {
            configurable: true,
            get() {
                return obj[prop]
            },
            set(value) {
                console.log(getNameSpace(namespace, prop));
                obj[prop] = value;
            }
        })
        //但是注意，如果obj[prop]也是一个对象，那么仅靠上述的步骤是无法监听子对象的变化的。因此我们要继续进行代理，即递归
        if (obj[prop] instanceof Object) {
            proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop)) //注意，递归调用的是最外层的constructProxy而不是constructObjectProxy,因为我们不知道这个子元素是数组还是对象

            // 注意：这个时候namespace作用来了！我们之前做的vm的代理，在最上级属性中，我们可以直接通过vm.prop操作和获取，但是，
            // 在下一层对象属性中，我们需要使用vm.prop1.prop来操作，这个时候我们修改的已经不是vm了，而是vm.prop1,
            // 因此我们必要准确确认修改的是谁，才能进行后续的监听。这个时候我们就需要找到下一层属性的父级属性，这个时候spacename就是为了找到它的父级属性的。
            // 在第一层属性中，自然是没有父级属性的，所有spacename为空串""


            //下面我们来定义一个操作namespace的方法： 
        }

    }


    return proxyObj
}

function getNameSpace(nowNameSpace, nowProp) {
    if (nowNameSpace == null || nowNameSpace == '') {
        return nowProp;
    } else if (nowProp == null || nowProp == '') {
        return nowNameSpace;
    } else {
        return nowNameSpace + '.' + nowProp
    }
}

export default function constructProxy(vm, obj, namespace) { //vm表示Due实例  obj表示要进行代理的对象 namespace保密，后面会讲到它的重要性
    //要用到很多递归算法。
    // 代理的对象要么是对象，要么是数组。因此我们要判断一下这个对象是数组还是对象
    let proxyObj
    if (obj instanceof Array) {

    } else if (obj instanceof Object) {
        proxyObj = constructObjectProxy(vm, obj, namespace)
    } else {
        throw new Error('Error，代理对象只能是对象或者数组')
    }

    return proxyObj;
}