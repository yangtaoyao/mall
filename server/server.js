const express = require('express');
const bodyParser = require('body-parser');
const glob = require('glob');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// 向外暴露 express app 模块
module.exports = app;

// 应用配置文件
const config = require('./app.config.js');

// 设置文件上传路径
config.setUploadsPath();

// session 配置
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// cookie 配置
app.use(cookieParser());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// ================ 处理前台路由 - 中间件 ===================
app.use('/', require('./client.js'));

// ================ 处理后台路由 - 中间件 ===================
// 跨域 和 session 校验
app.all('*', function(req, res, next){
    // 处理请求跨域
    // res.header('Access-Control-Allow-Origin', req.headers.origin);
	if (config.accessOrigin.indexOf(req.headers.origin) !== -1){
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	}
    // session 校验
    if (!req.session.isLogin){
        // 删除 cookie
        res.clearCookie('Admin-Token');
    }
    next();
});

// 静态资源服务
app.use('/admin', express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 同步载入所有路由控制器，返回文件路径数组
const routes = glob.sync('./controllers/**/*.js', {cwd: __dirname});
for (let i = 0, len = routes.length; i < len; i++){
    let router = require(routes[i]);
    // 只有请求地址为 router.prefix/* 类型, 才会由 router 路由对象来处理
    router.prefix && app.use(router.prefix, router);
	// 释放临时变量
    router = null;
}

// error 处理    错误处理器中间件并不捕获 404
app.use(function(err, req, res, next){
    console.error(err.stack);
    return res.status(500).send('Something broke!');
});

// 404
app.use(function(req, res){
    return res.status(404).sendFile(path.join(__dirname, 'views/err.html'));
});
