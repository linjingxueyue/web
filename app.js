var express = require('express')
var router = require('./router/router.js')
var session = require("express-session");



var app = express();
app.set('view engine','ejs')


// 设置session 
app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:true
}))


app.use(express.static('./public'))
app.use('/avatar',express.static('./avatar'))

app.get('/',router.showIndex)

// 注册 
app.get('/regist',router.showregist)
app.post('/doregist',router.doregist)

// 登录
app.get('/login',router.showlogin)
app.post('/dologin',router.dologin)

// 头像
app.get('/setavater',router.showsetavater)   // 上传头像
app.post('/dosetavater',router.dosetavater)   // 处理头像
app.get('/cut',router.showcut)
app.get('/docut',router.docut)

// 说说
app.post('/postshuoshuo',router.dopost)
app.get('/getallposts',router.getallposts)
app.get('/getuserinfo',router.getuserinfo)

// 分页
app.get('/postcount',router.postcount)

// 显示用户的主页
app.get('/user/:user',router.showuser)
// 显示用户列表
app.get('/userlist',router.showuserlist)


app.listen(80)


