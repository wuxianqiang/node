# node
## HTTP服务器

```js
//这是一个简单的Node HTTP服务器，能处理当前目录的文件，
//并能实现两种特殊的URL用于测试
//用http://localhost:8000或http://127.0.0.1:8000连接这个服务器
//首先，加载所有要用的模块
var http = require('http'); //HTTP服务器API
var fs = require('fs'); //用于处理本地文件
var server = new http.Server(); //创建新的HTTP服务器
server.listen(8000); //在端口8000上运行它
//Node使用"on()"方法注册事件处理程序，
//当服务器得到新请求，则运行函数处理它
server.on("request", function (request, response) { //解析请求的URL
    var url = require('url').parse(request.url); //特殊URL会让服务器在发送响应前先等待
    //此处用于模拟缓慢的网络连接
    if (url.pathname === "/test/delay") { //使用查询字符串来获取延迟时长，或者2000毫秒
        var delay = parseInt(url.query) || 2000; //设置响应状态码和头
        response.writeHead(200, {
            "Content-Type": "text/plain;charset=UTF-8"
        }); //立即开始编写响应主体
        response.write("Sleeping for" + delay + "milliseconds..."); //在之后调用的另一个函数中完成响应
        setTimeout(function () {
            response.write("done.");
            response.end();
        }, delay);
    }
    //若请求是"/test/mirror"，则原文返回它
    //当需要看到这个请求头和主体时，会很有用
    else if (url.pathname === "/test/mirror") { //响应状态和头
        response.writeHead(200, {
            "Content-Type": "text/plain;charset=UTF-8"
        }); //用请求的内容开始编写响应主体
        response.write(request.method + "" + request.url +
            "HTTP/" + request.httpVersion + "\r\n"); //所有的请求头
        for (var h in request.headers) {
            response.write(h + ":" + request.headers[h] + "\r\n");
        }
        response.write("\r\n"); //使用额外的空白行来结束头
        //在这些事件处理程序函数中完成响应：
        //当请求主体的数据块完成时，把其写入响应中
        request.on("data", function (chunk) {
            response.write(chunk);
        }); //当请求结束时，响应也完成
        request.on("end", function (chunk) {
            response.end();
        });
    }
    //否则，处理来自本地目录的文件
    else { //获取本地文件名，基于其扩展名推测内容类型
        var filename = url.pathname.substring(1); //去掉前导"/"
        var type;
        switch (filename.substring(filename.lastIndexOf(".") + 1)) { //扩展名
            case "html":
            case "htm":
                type = "text/html;charset=UTF-8";
                break;
            case "js":
                type = "application/javascript;charset=UTF-8";
                break;
            case "css":
                type = "text/css;charset=UTF-8";
                break;
            case "txt":
                type = "text/plain;charset=UTF-8";
                break;
            case "manifest":
                type = "text/cache-manifest;charset=UTF-8";
                break;
            default:
                type = "application/octet-stream";
                break;
        }
        //异步读取文件，并将内容作为单独的数据块传给回调函数
        //对于确实很大的文件，使用流API fs.createReadStream()更好
        fs.readFile(filename, function (err, content) {
            if (err) { //如果由于某些原因无法读取该文件
                response.writeHead(404, { //发送404未找到状态码
                    "Content-Type": "text/plain;charset=UTF-8"
                });
                response.write(err.message); //简单的错误消息主体
                response.end(); //完成
            } else { //否则，若读取文件成功
                response.writeHead(200, //设置状态码和MIME类型
                    {
                        "Content-Type": type
                    });
                response.write(content); //把文件内容作为响应主体发送
                response.end(); //完成
            }
        });
    }
});
```
## 解析数据
* 需要解析`rsp=0&inputT=2149&rsv_sug4=6234`这样的数据，可以使用queryString模块，转换为{rsp：0，inputT：2149，rsv_sug4：6234}
* url模块是专门解析url地址的

```js
//解析get数据

const http = require("http");
const urlLib = require("url");
var server = http.createServer((req, res) => {
    var obj = urlLib.parse(req.url, true);
    var url = obj.pathname;
    var data = obj.query;
    console.log(url,data);
    res.end();
})
server.listen(8080, () => {
    console.log("created success")
})
```
### 解析post数据
```js
//解析post数据

const http = require("http");
const queryString = require("querystring");
var server = http.createServer((req, res) => {
    var str = "";
    req.on("data", (data) => {
        str += data
    })
    req.on("end", () => {
        var data = queryString.parse(str);
        console.log(data);
    })
    res.end();
})
server.listen(8080, () => {
    console.log("created success")
})
```

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
//https://xxx.com/user/2.html

var routerUser = express.Router(); //创建路由
server.use("/user", routerUser); //添加到服务器上
routerUser.get("/1.html", function (req, res) {
  res.send("1")
})
routerUser.get("/2.html", function (req, res) {
  res.send("2")
})
```

## koa-router路由
```js
const Koa = require("koa")
const koaRouter = require("koa-router");
const app = new Koa();

let act = new koaRouter();//子路由
act
    .get("/reg", async(ctx) => {
        ctx.body = "注册"
    })
    .get("/login", async(ctx) => {
        ctx.body = "登入"
    })


let router = new koaRouter();//父路由
router.use("/act",  act.routes(), act.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8080, () => {
    console.log("create successfully!");
})

//http://localhost:8080/act/login
//http://localhost:8080/act/login
```
