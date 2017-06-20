var xlsx = require('node-xlsx');
var obj = xlsx.parse('./input/gitlab.xlsx');
var plist = obj[0].data;
var products = new Array();
var product = {};
var git = {};
var packageItem = {};
var gits = new Array();
var proMg = new Map([
    ['DM', '饶开铖'],
    ['CDM', '饶开铖'],
    ['DDM', '饶开铖'],
    ['WEBGIS', '饶开铖'],
    ['WEBTOPO', '饶开铖'],
    ['SF', '曹亮'],
    ['TNMS-RAS', '文华'],
    ['LIFECYC', '杨永'],
    ['RMS', '吴智辰'],
    ['HU', '饶开铖'],
    ['HFSS', '饶开铖'],
    ['HUSS', '饶开铖'],
    ['TNMS-AM', '冒红蔚'],
    ['TNMS-INF', '冒红蔚'],
    ['RMS-CMCC', '郑永华'],
    ['RMS-CUCC', '吴智辰'],
    ['SDUTN', '文华'],
    ['SPTN', '文华'],
    ['INCUBATOR', '文华'],
    ['DOC', '杜大江'],
    ['NFVO', '文华'],
    ['INNER', '杜大江'],
    ['DPS', '吴智辰']
]);
var devMg = new Map([
    ['DM', '冒红蔚'],
    ['CDM', '冒红蔚'],
    ['DDM', '冒红蔚'],
    ['WEBGIS', '冒红蔚'],
    ['WEBTOPO', '冒红蔚'],
    ['SF', '曹亮'],
    ['TNMS-RAS', '曹亮'],
    ['LIFECYC', '杨慧'],
    ['RMS', '杨慧'],
    ['HU', '冒红蔚'],
    ['HFSS', '冒红蔚'],
    ['HUSS', '冒红蔚'],
    ['TNMS-AM', '冒红蔚'],
    ['TNMS-INF', '冒红蔚'],
    ['RMS-CMCC', '王姗姗'],
    ['RMS-CUCC', '王姗姗'],
    ['SDUTN', '张永聪'],
    ['SPTN', '张永聪'],
    ['INCUBATOR', '张永聪'],
    ['DOC', '杜大江'],
    ['NFVO', '王瑞华'],
    ['INNER', '杜大江'],
    ['DPS', '杨慧']
]);

for (var i = 1; i < plist.length; i++) {
    var item = plist[i];
    // 如果item[0]不为null，意味着这是一个新的产品，products就需要新增加一个对象
    if (item[0]) {
        product = {};
        product['name'] = item[0].trim();
        product['id'] = item[1].trim();
        product['description'] = item[2].trim();
        product['type'] = '产品';
        product['province'] = item[13].trim();
        product['productManager'] = proMg.get(product['id']);
        product['developManager'] = devMg.get(product['id']);
        product['gits'] = new Array();
        products.push(product);
    }
    if (item[3]) {
        git = {};
        git['name'] = item[3].trim();
        git['id'] = item[5].trim();
        git['gitGroup'] = item[4].trim();
        git['type'] = 'git';
        git['province'] = item[6].trim();
        git['productManager'] = product['productManager'];
        git['developManager'] = product['developManager'];
        git['url'] = '/' + item[4].trim() + '/' + item[5].trim();
        git['packages'] = new Array();
        product.gits.push(git);
        gits.push(git);
    }
    if (item[7]) {
        packageItem = {};
        packageItem['name'] = item[9];
        packageItem['id'] = item[8].trim();
        packageItem['type'] = item[7].trim();
        packageItem['url'] = '';
        git.packages.push(packageItem);
    }
}
console.log(JSON.stringify(gits));
