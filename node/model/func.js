var fun2 = function (res){
	console.log('fun2:'+arguments.callee.name);
	res.write('hello, i am fun2');
}

var fun3 = function  (res){
	console.log('fun3');
	res.write('hello, i am fun3');
}

function one(f) {
    return function (x) {
    		//console.log('参数：'+Object.prototype.toString.call(arguments[0])+' |---| '+Object.prototype.toString.call(arguments[2]));
        console.log('函数名称'+arguments.callee.name);
        return f(x);
    }
};

module.exports={      
    func2 : fun2,      
    func3 : fun3 
} 