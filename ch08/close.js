'use strict';

// 定义数字0:
var zero = function(f) {
    return function(x) {
        return x;
    }
};

// 定义数字1:
var one = function(f) {
    return function(x) {
        //console.log('one' + f);
        console.log('one' + x);
        return f(x);
    }
};

// 定义加法:
function add(n, m) {
    return function(f) {
        return function(x) {
        	console.log('n---'+n);
        	console.log('m---'+m);
        	console.log('f---'+f);
        	console.log('x---'+x);
            return m(f)(n(f)(x));
        }
    }
}

// 计算数字2 = 1 + 1:
var two = add(one, one);

// 计算数字3 = 1 + 2:
var three = add(one, two);

// 计算数字5 = 2 + 3:
var five = add(two, three);

// 给3传一个函数,会打印3次:
// (one(function (i) {
//     console.log('print '+i+' times');
// }))(1);

function funPrint(i) {
	console.log('print self '+i);
	return function(x){
		console.log('print ' + x + ' times');
	}    
}

var ap = funPrint('ap');

console.log('----------');
// (two(ap))('a','b');

// 你说它是3就是3，你说它是5就是5，你怎么证明？

// 呵呵，看这里:

// // 给3传一个函数,会打印3次:
(two(function () {
    console.log('print 2 times');
}))();
