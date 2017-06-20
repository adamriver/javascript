import mysql from 'mysql';
import config from '../robot/config';
import SQLConfig from './SQLConfig';
import fs from 'fs';
import low from 'lowdb';
import xlsx from 'node-xlsx';

const dbGit = low('gitsInMag.json');

const pool = mysql.createPool(config.db);
const pool2 = mysql.createPool(config.db2);
const query = function(sql, dbnum, callback) {
	let poolself = pool;
	if(dbnum === 2) {
		poolself = pool2;
	};
	poolself.getConnection(function(err, conn) {
		if(err) {
			callback(err, null, null);
		} else {
			conn.query(sql, function(qerr, vals, fields) {
				// 释放连接
				conn.release();
				// 事件驱动回调
				callback(qerr, vals, fields);
			});
		}
	});
};

const mysqlUpdate = function(sql, sqlParams, dbnum, callback) {
	let poolself = pool;
	if(dbnum === 2) {
		poolself = pool2;
	};
	poolself.getConnection(function(err, conn) {
		if(err) {
			callback(err, null, null);
		} else {
			conn.query(sql, sqlParams, function(qerr, vals, fields) {
				// 释放连接
				// console.log('-----更新数据----'+vals.affectedRows);
				conn.release();
				// 事件驱动回调
				callback(qerr, vals, fields);
			});
		}
	});
};

const myQuery = (sql, db) => {
	let dbnum = 0;
	if(db) dbnum = db;
	return new Promise((resolve, reject) => {
		query(sql, dbnum, (err, vals, fields) => {
			if(err) {
				reject('SQL出错' + err.message);
			} else {
				console.log(vals.length);
				resolve(vals);
			}
		});
	});
};

const myUpdate = (sql, sqlParams, db) => {
	let dbnum = 0;
	if(db) dbnum = db;
	return new Promise((resolve, reject) => {
		mysqlUpdate(sql, sqlParams, dbnum, (err, vals, fields) => {
			if(err) {
				reject('SQL出错' + err.message);
			} else {
				console.log(vals.length);
				resolve(vals);
			}
		});
	});
};

const specsStr = (arr, num) => {
	let str = '| ';
	if(num === 0) {
		arr.forEach((x) => {
			str += ':------:|';
		});
	} else {
		arr.forEach((x) => {
			str += x + ' | ';
		});
	};
	str += ' \n';
	return str;
};

// 查询前一工作日中报工数为制定数量以下的人员名单
let sql1 = 'select account, (select realname from zentao.zt_user b where tab.account = b.account) as name,all_consumed from( select sum(consumed) as all_consumed,account from(select a.account, case when b.consumed is null then 0 else b.consumed end as consumed from zentao.zt_user a left join(select * from zt_taskestimate where date_format(date, "%Y-%m-%d") = date_format(date_sub(curdate(), interval 1 day), "%Y-%m-%d")) b on a.account = b.account) aa group by account) as tab where all_consumed < 5 ';
// 查询在综合资源这个大部门下面有哪些小部门
let sql2 = 'SELECT a.account, a.dept FROM zt_user a WHERE a.dept IN (SELECT x.id FROM zt_dept x WHERE left(x.path, 3) = ",1," and left(x.path, 5) != ",1,2," and left(x.path, 5) != ",1,5,")';
const check = () => {
	// getAccountListNoWork(1, 1).then((ret) => {
	//     console.log(JSON.stringify(ret));
	// }).catch((rej) => {
	//     console.log(JSON.stringify(rej));
	// });
	let a = myQuery(sql1);
	let b = myQuery(sql2);
	Promise.all([a, b]).then(function(vals) {
		// console.log(JSON.stringify(vals));
		let ret = vals[0].filter((x) => {
			return vals[1].some((y) => {
				return x.account === y.account;
			});
		});
		let outputStr = '';
		outputStr += '--- \n';
		outputStr += '前一工作报工时长低于5小时名单:  \n';
		outputStr += '  \n';
		outputStr += '| 姓名 | 报工时长 | 情况说明 |  \n';
		outputStr += '| ---- |:------:| -----:| \n';
		ret.forEach((x) => {
			outputStr += '|' + x.name + ' | ' + x.all_consumed + '|   |  \n';
		});
		let outputFile = 'WT' + new Date().toLocaleDateString() + '.md';
		fs.writeFileSync(outputFile, outputStr);
		console.log('完成');
	});
};

let sql3 = 'select a.*,b.realname,x.name as deptname,x.path as path from zentao.zt_task a,zt_user b,zt_dept x where  date_format(a.openeddate, "%Y-%m-%d") > date_format("2016-12-25", "%Y-%m-%d") and a.type="devel"  and a.status != "wait" and a.deleted = "0" and a.openedBy = b.account and b.dept = x.id and left(x.path, 3) = ",1," and left(x.path, 5) != ",1,2," and left(x.path, 5) != ",1,5," ';
const checkTask = () => {
	var gitsInMag = dbGit.get('gitsInMag').value();
	let taskNum = 0;
	myQuery(sql3).then((val) => {
		taskNum = val.length;
		console.log(taskNum);
		// console.log(JSON.stringify(val));
		let ret = val.filter((x) => {
			return gitsInMag.every((y) => {
				return y.branches.every((z) => {
					if(z.name.toLowerCase() === 'feature-' + x.id) {
						// console.log('在git中发现分支:' + z.name);
					}
					let ifFeature = z.name.toLowerCase() !== 'feature-' + x.id;
					//  let ifRelease = z.name.toLowerCase() === 'release-' + x.id;
					return ifFeature;
				});
			});
		});
		console.log('ddj: ' + ret.length);
		ret.sort((a, b) => {
			if(a.path < b.path) return -1;
			if(a.path > b.path) return 1;
			return 0;
		});
		let excelData = [
			['任务号', '部门名称', '建任务人员', '任务名称', '目前任务状态']
		];

		let outputStr = '';
		console.log('outputStr');
		outputStr += '---  \n';
		outputStr += '在本月禅道系统中建立的类型为【研发-开发]的任务，共计:' + taskNum + ' \n';
		outputStr += '但是在git中有: ' + ret.length + ' 没有发现其开发分支: \n';
		outputStr += '  \n';
		outputStr += specsStr(excelData[0]);
		outputStr += specsStr(excelData[0], 0);
		console.log(outputStr);
		// outputStr += '| ---- |:------:|:------:|:------:| -----:| \n';
		ret.forEach((x) => {
			// outputStr += '|' + x.id + ' | ' + x.deptname + ' | ' + x.realname + ' | ' + x.name + ' | ' + x.status + '| \n';
			let excelOne = [x.id, x.deptname, x.realname, x.name, x.status];
			excelData.push(excelOne);
			outputStr += specsStr(excelOne);
			// console.log('ok:' + specsStr(excelOne));
		});
		console.log(outputStr);
		let outputFile = 'TASK' + new Date().toLocaleDateString() + '.md';
		fs.writeFileSync(outputFile, outputStr);

		var buffer = xlsx.build([{
			name: 'zhzy',
			data: excelData
		}]); // Returns a buffer
		fs.writeFileSync('task.xlsx', buffer, {
			'flag': 'w'
		});

		console.log('完成！');
	}).catch((rej) => {
		console.log(JSON.stringify(rej));
	});
};

const exportExcel = (name, arr) => {
	var buffer = xlsx.build([{
		name: 'work',
		data: arr
	}]); // Returns a buffer
	fs.writeFileSync('./input/' + name + '.xlsx', buffer, {
		'flag': 'w'
	});
};

const exportCSV = (name, arr) => {
	let outputStr = '';
	arr.forEach((x) => {
		outputStr += x.join() + '\r\n';
	});
	fs.writeFileSync('./input/' + name + '.csv', outputStr);
};

const changeDBList = (arr) => {
	let ret = new Array();
	let header = Object.keys(arr[0]);
	ret.push(header);
	arr.forEach((x) => {
		let item = new Array();
		header.forEach((it) => {
			item.push(x[it]);
		});
		ret.push(item);
	});
	return ret;
};

const exportDB = (name, sql) => {
	myQuery(sql).then((val) => {
		let arr = changeDBList(val);
		exportExcel(name, arr);
		exportCSV(name, arr);
		console.log(name + ':输出完成！');
	});
};
const exportDB2 = (name, sql) => {
	myQuery(sql, 2).then((val) => {
		let arr = changeDBList(val);
		exportExcel(name, arr);
		exportCSV(name, arr);
		console.log(name + ':输出完成！');
	});
};
const exportAll = () => {
	let sqlNames = Object.keys(SQLConfig.db);
	sqlNames.forEach((x) => {
		exportDB(x, SQLConfig.db[x]);
	});
	let sqlNames2 = Object.keys(SQLConfig.db2);
	sqlNames2.forEach((x) => {
		exportDB2(x, SQLConfig.db2[x]);
	});
};

let sqlselect1 = 'select month,name,allworklog,allunworklog from bi_report_amb_worklogtbymonth group by name,month ';
let sqlupdate = 'update bi_report_amb_accountbymonth set worklog = ?,unworklog=?,overtime=? where month=? and name=?';
let worklogMonth = new Map([
	["201701", "168"],
	["201702", "120"],
	["201703", "160"],
	["201704", "168"],
	["201705", "168"],
	["201706", "160"],
	["201707", "176"],
	["201708", "184"],
	["201709", "168"],
	["201710", "144"],
	["201711", "176"],
	["201712", "168"]
]);
const updateUserWorklog = (month) => {
	myQuery(sqlselect1).then((val) => {
		let rtvals = val;
		if(month) {
			rtvals = val.filter((x) => {
				return x.month === month;
			});
		};
		console.log(month + ':查询' + rtvals.length);
		rtvals.forEach((x) => {
			let allwork = worklogMonth.get(x.month);
			let overtime = x.allworklog + x.allunworklog - allwork;
			let params = [x.allworklog, x.allunworklog, overtime, x.month, x.name];
			myUpdate(sqlupdate, params).then((y) => {
				console.log('更新完成' + x.month + '-' + x.name + '-' + x.allworklog + '-' + x.allunworklog + '-' + overtime);
			});
		});
	});
};

module.exports={      
    exportAll : exportAll,      
    updateAll : updateUserWorklog
} 
//exportAll();
// updateUserWorklog('201705');