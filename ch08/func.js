function getRealDate(str) {
	var year = str.substr(0, 4);
	var month = str.substr(4);

	var time = new Date();
	var todaymonth = time.getMonth() + 1;
	var day = time.getDate();

	var endday = "";

	if((parseInt(month) === todaymonth) && (day < 26)) {
		endday = year + "-" + month + "-" + day;
	} else {
		endday = year + "-" + month + "-25";
	}

	if(month === "01") {
		year = year - 1;
		month = 12;
	} else {
		month = month - 1;
		if(month < 10) {
			month = "0" + month;
		}
	}
	var beginday = year + "-" + month + "-26";
	return [beginday, endday];
}

function getTimeLimit(begindate, enddate, stage) {
	var diffday = parseInt(Math.abs(enddate - begindate) / 1000 / 60 / 60 / 24);
	var ret = 0;
	switch(stage) {
		case 0:
			if(diffday < 31) {
				ret = 1;
			} else if(diffday < 61) {
				ret = 2;
			} else if(diffday < 91) {
				ret = 3;
			} else {
				ret = 4;
			};
			break;
		case 2:
			if(diffday < 15) {
				ret = 1;
			} else if(diffday < 31) {
				ret = 2;
			} else if(diffday < 61) {
				ret = 3;
			} else {
				ret = 4;
			};
			break;
		default:
			if(diffday < 8) {
				ret = 1;
			} else if(diffday < 31) {
				ret = 2;
			} else if(diffday < 61) {
				ret = 3;
			} else {
				ret = 4;
			};
			break;
	}
	return ret;
}

//var str = "201704";
//var aa = getRealDate(str);
//console.log(aa[0]);
//console.log(aa[1]);

var aa1 = new Date('2017-1-1');
var aa2 = new Date('2017-8-24');
console.log(getTimeLimit(aa1, aa2, 1));

var newItem = {
	"month": "201701",
	"name": "综合资源",
	"sumlast": 1,
	"sumnew": 2,
	"sumclose": 3,
	"sumunclose": 4
};

function getReplaceSQL(tabname, newitem) {
	var str = "REPLACE INTO " + tabname + " SET ";
	var items = new Array();
	var params = new Array();
	for(prop in newitem) {
		var item = prop + " = ? ";
		items.push(item);
		params.push(newitem[prop]);
	};
	str += items.join(",");
	var ret = {
		sql: str,
		params: params
	};
	return ret;
}
//var params = new Array();
//var sqlstr = "";
//var aa = getInsertSQL("aaa", newItem);
//console.log("sqlstr:" + sqlstr);
//console.log("params:" + params.join(","));

var aaa = new Array();
var item3 = {
	m: "201703",
	id : "30"
};
aaa.push(item3);
var item4 = {
	m: "201704",
	id : "400"
};
aaa.push(item4);
var item1 = {
	m: "201701",
	id : "100"
};
aaa.push(item1);
var item2 = {
	m: "201702",
	id : "2001"
};
aaa.push(item2);
aaa.forEach(function(x) {
	console.log('排序前' + x.m + "-" + x.id);
})
aaa.sort(function(a, b) {
	return a.m - b.m;
})
aaa.forEach(function(x) {
	console.log('排序后' + x.m + "-" + x.id);
})