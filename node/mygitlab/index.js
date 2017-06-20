require('babel-register');
require('babel-polyfill');
var check = require('./check');

function main() {
	var stream = null;
	var month = '201706';
	var paramArgus = process.argv.splice(2);
	if(!paramArgus || paramArgus.length == 0) {
		stream = 'exportAll';
	} else {
		stream = paramArgus[0];
		if (paramArgus[1]){
			month = paramArgus[1];
		}
	}
	if (stream === 'exportAll'){
		check.exportAll();
	}else{
		check.updateAll(month);
	}
}

main();
