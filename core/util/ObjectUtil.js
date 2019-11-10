export function getValue(obj, name) {//{ {{key}}除了这种形式，还可能key本身就是一个对象，因此是： {{obj.a}} 
    if (!obj) {
        return obj
    }

    let nameList = name.split('.');  //可以用递归，也可以用for循环。

    let temp = obj
    for (let i = 0; i < nameList.length; i++) {

        if (temp[nameList[i]]) {
            temp = temp[nameList[i]]
        } else {
            return undefined;
        }
    }

    return temp;
}