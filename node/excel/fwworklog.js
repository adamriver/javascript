var xlsx = require('node-xlsx');
var fs = require('fs');
var join = require('path').join;

/*
 * 解析指定的xls文件A，将
 */
function change(fileName) {
	try {
		var obj = xlsx.parse(fileName);
		var plists = obj[0].data;
		var first = plists[0];
		var len = plists[0].length - 6;
		var ret = new Array();
		ret.push(first);
		for(var i = 1; i < plists.length; i++) {
			var one = plists[i];
			var newdata = one.slice(0, 14);
			var baogong = newdata[6];
			for(var j = len; j < one.length; j++) {
				if(one[j]) {
					var dd = one[j];
					var realbaogong = baogong * dd / 100;
					var realdata = newdata.concat();
					
					realdata.push(first[j]);
					realdata.push(realbaogong);
					console.log(realdata.toString());
					ret.push(realdata);
				}
			}
			//console.log(newdata.toString());
		}
		return ret;

	} catch(e) {
		console.log(fileName + ' is error!' + e.toString());
	}

}

/*
 * 把一个数组的内容输出成excel文件
 */
function exportFile(arr) {
	var buffer = xlsx.build([{
		name: 'zhzy',
		data: arr
	}]); // Returns a buffer
	fs.writeFileSync('./input/zhzy.xlsx', buffer, {
		'flag': 'w'
	});
}

/*
 * 主程序,用来将各省服务报工，刘迎给我的一行多列的表，转换成多行的表
 * 输入：./input/OSS.xlsx
 * 输出：./input/zhzy.xlsx
 */
function main() {
	var stream = null;
	var paramArgus = process.argv.splice(2);
	if(!paramArgus || paramArgus.length == 0) {
		stream = './input/OSS.xlsx';
	} else {
		stream = paramArgus[0];
	}
	var realdata = change(stream);
	exportFile(realdata);
	//console.log(realdata.toString());
}

main();