var User = require('./User');

function Teacher(id,name,age){
	User.apply(this,[id,name,age])
	this.teach = function(){
		console.log(this.name + '开始教学');
	}
}
module.exports = Teacher;