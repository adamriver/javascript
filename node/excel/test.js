var xlsx = require('node-xlsx');
var obj = xlsx.parse('kt.xlsx');
//console.log(JSON.stringify(obj));

var plist = obj[0].data;

var products = new Array();
var product = {};
var git = {};
var packageItem ={};

for(i=1;i<plist.length;i++){
	var item = plist[i];
	//如果item[0]不为null，意味着这是一个新的产品，products就需要新增加一个对象
	if(item[0]){		
		product= {};
		product['name'] = item[0];
		product['id'] = item[1];
		product['type'] = '产品';
		product['province'] = '';
		product['productManager'] = '';
		product['developManager'] = '';
		product['gits'] = new Array();
		products.push(product);
	}
	if(item[2]){
		git = {};
		git['name'] = item[3];
		git['id'] = item[2];
		git['type'] = 'git';
		git['province'] = item[7];
		git['url'] = '';
		git['packages'] = new Array();
		product.gits.push(git);
	}
	if (item[4]){
		packageItem = {};
		packageItem['name'] = item[6];
		packageItem['id'] = item[5];
		packageItem['type'] = item[4];
		packageItem['url'] = '';
		git.packages.push(packageItem);
	}
	//
//	if(item[2])
}
	console.log(JSON.stringify(products));
