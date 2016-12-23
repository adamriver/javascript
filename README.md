# javascript
- 学习JavaScript的点点滴滴
 - 直接把子目录中的js文件下载后运行（可以用node直接运行），可以看见每个js的运行效果
 - ch08(函数)
   - close.js:关于闭包

- 学习node的点点滴滴
 - excel
  - 只要npm install node-xlsx 先安装node-xlsx就可以使用了
  - test.js中使用了node-xlsx来对产品线的excel文档进行分析
  - 使用node-xlsx非常简单：
  ```
var xlsx = require('node-xlsx');
var obj = xlsx.parse('gitlab.xlsx');
var plist = obj[0].data;
```
 - robot 
  - 2016-12-23 如何编写自动脚本去一个论坛进行发帖，自动顶贴？
  - 在优酷上有该视频[如何抢HR的饭碗](http://v.youku.com/v_show/id_XMTg2MzIxMzA1Mg==.html?from=s1.8-1-1.2&spm=a2h0k.8191407.0.0)
  - 安装引用：
   - 现在空目录中npm init -y,建立一个空的package.json
   - 用babel可以将我们写的es6的语法转换成es5的语法，这样可以使用es6里面的await等语法
```
npm install babel-register --save
```
   - 更高级的语法还需要安装 polyfill
```
npm install babel-polyfill --save
```
   - 安装实现babel的plugin
```
npm install --save babel-preset-latest
```
   - 安装完成后在当前目录下面建立.babelrc，并在文中填入以下内容
```
{
  "presets": ["latest"]
}
```
