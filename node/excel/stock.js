var xlsx = require('node-xlsx');
var fs = require('fs');
var join = require('path').join;

//从输入的startPath目录中读取所有的文件，放入返回的数组中
function findSync(startPath) {
	var result = [];

	function finder(path) {
		var files = fs.readdirSync(path);
		files.forEach((val, index) => {
			var fPath = join(path, val);
			var stats = fs.statSync(fPath);
			//if(stats.isDirectory()) finder(fPath);
			if(stats.isFile()) {
				var arrval = val.split('.');
				if (arrval[arrval.length-1] == 'xlsx' || arrval[arrval.length-1] == 'xls') result.push(fPath);
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

		var outputStr = ['', '', '', '', ''];
		var outputFilename = [fileName + '-1.csv', fileName + '-2.csv', fileName + '-3.csv', fileName + '-4.csv', fileName + '-5.csv'];

		for(var i = 0; i < plists.length; i++) {
			var line = plists[i].join();
			if(i === 0) {
				for(var j = 0; j < outputFilename.length-1; j++) {
					outputStr[j] += line+'\n';
				}
			} else {
				var rowid = i % 3;
				//console.log(rowid);
				outputStr[rowid] += line + '\n';
				outputStr[3] += line + '\n';
				var last = line.lastIndexOf(',');
				var temp = line.substr(0, last) + '\n';				
				outputStr[4] += temp;
			}
		}

		for(var i = 0; i < outputFilename.length; i++) {
			fs.writeFileSync(outputFilename[i], outputStr[i]);
		}
	} catch(e) {
		console.log(fileName + ' is error!'+e.toString());
	}

}

/*
 * 主程序
 */
function main() {
	var stream = null;
	var paramArgus = process.argv.splice(2);
	if(!paramArgus || paramArgus.length == 0) {
		stream = 'stock1';
	} else {
		stream = paramArgus[0];
	}
	var files = findSync(stream);
	files.forEach(function(x) {
		console.log(x);
		exportFiles(x);
	})
}

main();