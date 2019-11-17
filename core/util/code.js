export function generateCode (attr) { //传入的是一个数据对象，假如是{content: 'ljz', list: [{}, {}], obj: {money: 100}}
    let code = "";
    for (let prop in attr) {
        code += "let " + prop + "=" + JSON.stringify(attr[prop]) + ";"
    }

    return code;
    //最后返回的是字符串："let content='ljz';let list=[{}{}];let obj:{'money': 100}"

}

export function isTrue (expression, env) {

    let bool = false;
    let code = env;
    code += "if(" + expression + "){bool = true;}"; 

    eval(code);

    return bool;
}