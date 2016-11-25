var fun2 = function (res){
	console.log('fun2');
	res.write('hello, i am fun2');
}

var fun3 = function  (res){
	console.log('fun3');
	res.write('hello, i am fun3');
}

function one(f) {
    return function (x) {
        return f(x);
    }
};

module.exports={      
    func2 : one(fun2),      
    func3 : one(fun3) 
} 