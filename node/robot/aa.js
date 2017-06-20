var str2 = '大约 1 个月之前';
var str = '大约 2 小时之前';
var str1 = '大约 15 天之前';

var status = -1;
if (str.indexOf('小时') > 0) {
	status = 0;
}
else if (str.indexOf('月') > 0) {
	console.log(str);
    status =30;
}
else if(str.indexOf('天') > 0) {
	var a = str.split(' ');
	status = a[1];
}
var proMg = new Map([
    ['dm', '饶开铖'],
    ['cdm', '饶开铖'],
    ['ddm', '饶开铖'],
    ['sf', '曹亮'],
    ['tnms', '文华'],
    ['lifecyc', '杨永'],
    ['irms.rms', '徐鹏'],
    ['IRMS-HU', '饶开铖'],
    ['ROFH', '饶开铖'],
    ['huss', '吴智辰'],
    ['tnms_am', '冒红蔚']
])

console.log(JSON.stringify(proMg))
