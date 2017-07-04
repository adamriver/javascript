var xlsx = require('node-xlsx');
var fs = require('fs');
var join = require('path').join;

var DAYB = 12;

//从输入的startPath目录中读取所有的文件，放入返回的数组中
function findSync(startPath) {
	var result = [];

	function finder(path) {
		var files = fs.readdirSync(path);
		files.forEach((val, index) => {
			var fPath = join(path, val);
			var stats = fs.statSync(fPath);
			//if(stats.isDirectory()) finder(fPath);
			if (stats.isFile()) {
				var arrval = val.split('.');
				if (arrval[arrval.length - 1] == 'xlsx' || arrval[arrval.length - 1] == 'xls') result.push(fPath);
			}
		});

	}
	finder(startPath);
	return result;
}

/*
 * 解析指定的xls文件A，将数据读取并分解后，形成5个文件：文件分别为A1，A2，A3，A4，A5
 * 其中A1-A3分别为aria需要读取的三个文件，A4为为A1-A3的合集，A5为验证数据需要的文件
 */
function exportFiles(fileName) {
	try {
		var obj = xlsx.parse(fileName);
		var plists = obj[0].data;
		var objlists = new Array();

		var outputStr = ['', '', '', '', ''];
		var outputFilename = [fileName + '-1.csv', fileName + '-2.csv', fileName + '-3.csv', fileName + '-4.csv', fileName + '-5.csv'];

		console.log('总行数：' + plists.length);
		console.log('第一行：' + plists[0].length);
		//plists.length-DAYB-1
		for (var i = 1; i < plists.length - DAYB - 1; i++) {
			var mm = maxandmin(plists, i);
			// plists[i].push(mm.max);
			// plists[i].push(mm.min);
			// plists[i].push(mm.incre);
			// plists[i].push(mm.drop);
			plists[i].push(mm.level);
			var str = plists[i][12].toString;
			if (str.length > 0) {
				objlists.push(plists[i]);
			}
		}

		// for (var i = 0; i < 5; i++) {
		// 	console.log('第'+i+'行：' + JSON.stringify(objlists[i]));
		// }
		console.log('总行数：' + objlists.length);

		var line = plists[0].join();
		for (var j = 0; j < outputFilename.length - 1; j++) {
			outputStr[j] += line + '\n';
		}

		for (var i = 0; i < objlists.length; i++) {
			var tempArr = objlists[i];
			tempArr.shift();
			tempArr.unshift(i);
			var line = tempArr.join();
			var rowid = i % 3;
			//console.log(rowid);
			outputStr[rowid] += line + '\n';
			outputStr[3] += line + '\n';
			var last = line.lastIndexOf(',');
			var temp = line.substr(0, last) + '\n';
			outputStr[4] += temp;
		}

		for (var i = 0; i < outputFilename.length; i++) {
			fs.writeFileSync(outputFilename[i], outputStr[i]);
		}
	} catch (e) {
		console.log(fileName + ' is error!' + e.toString());
	}

}

function trim(str) {
	str = str.replace(/^(\s|\u00A0)+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}

function maxandmin(arr, index) {
	var maxmin = {
		max: -100,
		min: 10000
	};
	for (var i = index + 1; i <= index + DAYB; i++) {
		if (maxmin.max < arr[i][2]) {
			maxmin.max = arr[i][2];
		};
		if (maxmin.min > arr[i][3]) {
			maxmin.min = arr[i][3];
		};
	};
	maxmin.incre = (maxmin.max - arr[index][4]) * 100 / arr[index][4];
	maxmin.drop = (maxmin.min - arr[index][4]) * 100 / arr[index][4];
	maxmin.level = (maxmin.incre * 100 / (maxmin.incre - maxmin.drop)).toFixed(1);
	return maxmin;
}
/*
 * 主程序
 */
function main() {
	var stream = null;
	var paramArgus = process.argv.splice(2);
	if (!paramArgus || paramArgus.length == 0) {
		stream = 'stock1';
	} else {
		stream = paramArgus[0];
	}
	var files = findSync(stream);
	files.forEach(function (x) {
		console.log(x);
		exportFiles(x);
	})
}

main();