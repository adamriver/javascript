var xlsx = require('node-xlsx');
var fs = require('fs');
var join = require('path').join;
var csv = require('fast-csv');

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
                if (arrval[arrval.length - 1] == 'csv') result.push(fPath);
            }
        });

    }
    finder(startPath);
    return result;
}

/*
 *读取filename，将csv中的内容转换成一个数组
 * 
 */
function exportFiles(fileName) {
    // csv.from.stream(fs.createReadStream(fileName))
    //     .transform(function (row) {
    //         row.unshift(row.pop());
    //         console.log(JSON.stringify(row));
    //         return row;
    //     })
    //     .on('end', function (count) {
    //         console.log('总行数' + count);
    //     })
    //     .on('error', function (error) {
    //         console.log(error.message);
    //     });
    var stream = fs.createReadStream(fileName);
    var arr = new Array();

    csv.fromStream(stream, { headers : true})
        .on("data", function (data) {
            arr.push(data);
            
        })
        .on("end", function () {
            console.log("done");
            var data = arr[arr.length-1];
            console.log(arr.length+":"+JSON.stringify(data));
        });

}

/*
 * 主程序
 */
function main() {
    var stream = null;
    var paramArgus = process.argv.splice(2);
    if (!paramArgus || paramArgus.length == 0) {
        stream = 'stock';
    } else {
        stream = paramArgus[0];
    }
    // var files = findSync(stream);
    // files.forEach(function(x) {
    // 	console.log(x);
    // })
    var files = 'stock/1.csv';
    exportFiles(files);

}

main();