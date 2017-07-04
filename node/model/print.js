var exec = require('child_process').exec;
var fs = require('fs');
var join = require('path').join;

/**
 * 从输入的startPath目录中读取所有的文件，放入返回的数组中
 * 可以是递归整个目录
 * @param {*} startPath 
 */
function findSync(startPath) {
    var result = [];
    var postfix = ['png','jpeg','pdf','jpg'];

    function finder(path) {
        var files = fs.readdirSync(path);
        files.forEach((val, index) => {
            var fPath = join(path, val);
            var stats = fs.statSync(fPath);
            //if(stats.isDirectory()) finder(fPath);
            if (stats.isFile()) {
                var arrval = val.split('.');
                var valpost = arrval[arrval.length - 1];
                if (postfix.indexOf(valpost) > -1) result.push(fPath);
                // if (arrval[arrval.length - 1] == 'xlsx' || arrval[arrval.length - 1] == 'xls') result.push(fPath);
            }
        });

    }
    finder(startPath);
    return result;
}

/*
 * 根据指定的文件名，
 */
function printFiles(fileName) {
    var cmdStr = "lp " + fileName;
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('print error:' + stderr);
        } else {
            console.log('print ok!' + fileName);
        }
    });

}

/*
 * 主程序
 */
function main() {
    var stream = null;
    var paramArgus = process.argv.splice(2);
    if (!paramArgus || paramArgus.length == 0) {
        stream = '/Users/shirly/ddj/temp/printfile';
    } else {
        stream = paramArgus[0];
    }
    var files = findSync(stream);
    files.forEach(function (x) {
        console.log(x);
        printFiles(x);
    })
}

main();