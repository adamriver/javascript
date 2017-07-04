var User = require('./User');
var Teacher = require('./Teacher');
var toPdf = require("office-to-pdf")
 
toPdf("test.docx").then(
  () => {
    console.log("OK")
  }, (err) => {
    console.log(err)
  }
)

var user1 = new User(1,'zhangsan',20);
var teacher1 = new Teacher(2,'李四',21);

teacher1.enter();
teacher1.teach();