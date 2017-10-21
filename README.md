# node
node基础

## consolidate模板适配
1. 安装
2. 配置
```js
server.set("view engine", "html"); // 以什么形式输出给用户
server.set("view", "模板目录"); //指定模板存放的位置
server.engine("html", consolidate.ejs) //指定html使用ejs模板引擎来做

//当接收到请求的时候
server.use(function () {
  res.render("模板文件", "数据") //指定要输出哪个模板文件
})
```
## Router路由（子服务）
1. 使用方法

```js
//https://xxx.com/user/1.html
//https://xxx.com/user/1.html

var routerUser = express.Router(); //创建路由
server.use("/user", routerUser); //添加到服务器上
routerUser.get("/1.html", function (req, res) {
  res.send("1")
})
routerUser.get("/2.html", function (req, res) {
  res.send("2")
})
```
