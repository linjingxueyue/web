
var formidable = require('formidable')
var db = require('../model/db.js')
var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var gm = require('gm')

exports.showIndex = function (req, res) {
    // 根据session的username 查找此人的头像
    var login = 'x'
    var avatar = 'y'
    console.log(req.session.login)
    if (req.session.login == '1') {
        login = true
        var username = req.session.username
    } else {
        login = false
        var username = ''
    }
    db.findeDB('users', { 'username': username }, function (err, rseult) {
        if (rseult.length == 0) {
            avatar = 'moren.jpg'

        } else {
            avatar = rseult[0].avatar || 'moren.jpg'
        }
        console.log(rseult)
        res.render('main', {
            'login': login,
            'username': req.session.username || '',
            "active": 'main',
            "avatar": avatar,
            "posts":[{"username":"临京","password":"1234"}]
           
        })
    })


}
// 注册页面
exports.showregist = function (req, res) {
    res.render('regist', {
        'login': req.session.login == '1' ? true : false,
        'username': req.session.username || '',
        "active": 'regist'
    })
}
// 执行注册操作
exports.doregist = function (req, res) {
    //得到用户填写的数据信息
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields) {
        // 匹配数据库
        var username = fields.username
        var password = fields.password
        password = md5(password)
        db.findeDB('users', { 'username': username }, function (err, result) {
            if (err) {
                res.send('-3')  // 服务器查询出错
                return
            }
            if (result.length != 0) {
                res.send('-1')   // 被占用
                return
            }
            db.insertDB('users', [{
                'username': username,
                'password': password,
                'avatar': "moren.jpg"
            }], function (err, result2) {
                if (err) {
                    res.send('-3')  // 服务器查询出错
                    return
                }
                req.session.login = '1'
                req.session.username = username
                res.send('1')   // 注册成功

            })
        })

    })

}

// 登录页面
exports.showlogin = function (req, res) {
    res.render('login', {
        'login': req.session.login == '1' ? true : false,
        'username': req.session.username || '',
        "active": 'login'
    })
}

// 执行登录操作
exports.dologin = function (req, res) {
    //得到用户表单
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields) {
        // 匹配数据库
        var username = fields.username
        var password = fields.password
        password = md5(password)
        db.findeDB('users', { 'username': username }, function (err, result) {
            if (err) {
                res.send('-3')  // 服务器查询出错
                return
            }
            if (result.length == 0) {
                res.send('-1')   // 用户名不存在
                return
            }
            var password_mongo = result[0].password
            if (password == password_mongo) {

                req.session.login = '1'
                req.session.username = username
                console.log("login")
                console.log("login-----------------" + req.session.login)
                res.send('1')   // 注册成功
            } else {
                res.send('-2')  //密码错误
            }

        })

    })
}

// 头像上传页面
exports.showsetavater = function (req, res) {
    // 设置头像 必须保证是登录页面
    if (req.session.login != 1) {
        res.send("非法闯入，请立即离开")
        return
    }
    res.render('setavater', {
        'login': true,
        'username': req.session.username || 'linjing',
        "active": 'setavater'
    })
}

// 上传头像并跳转到剪切图片页面
exports.dosetavater = function (req, res) {
    if (req.session.login != 1) {
        res.send("非法闯入，请立即离开")
        return
    }
    var form = new formidable.IncomingForm()
    form.uploadDir = path.normalize(__dirname + '/../avatar/')
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err)
            return
        }

        var oldname = files.image.path
        var newname = path.normalize(__dirname + '/../avatar/') + req.session.username + '.jpg'
        fs.rename(oldname, newname, function (err) {
            if (err) {
                res.send("失败")
                return
            }
        })
        req.session.avatar = req.session.username + '.jpg'
        res.redirect('/cut')
    })
}
// 剪切图片
exports.showcut = function (req, res) {
    if (req.session.login != 1) {
        res.send("非法闯入，请立即离开")
        return
    }

    res.render('jqcrop', {
        'avatar': req.session.avatar

    })
}
// 执行剪切图片
exports.docut = function (req, res) {
    if (req.session.login != 1) {
        res.send("非法闯入，请立即离开")
        return
    }
    var w = req.query.w
    var h = req.query.h
    var y = req.query.y
    var x = req.query.x

    gm('./avatar/' + req.session.avatar)
        .crop(w, h, x, y)
        .resize(100, 100, '!')   // ! 表示强行按照 100 100不用按照宽高比
        .write('./avatar/' + req.session.avatar, function (err) {
            if (err) {
                res.send('-1')
                return
            }
            else {
                db.updateDB('users', { "username": req.session.username },
                    { $set: { "avatar": req.session.avatar } }, function (err, results) {
                        res.send('1')
                    })

            }
        });
}

// 发表说说
exports.dopost = function (req, res) {
    if (req.session.login != 1) {
        res.send("非法闯入，请立即离开")
        return
    }
    //得到用户填写的数据信息
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields) {
        // 匹配数据库
        var username = req.session.username
        var content = fields.content
        db.insertDB('posts', [{ 'username': username, 'content': content, 'datetime': new Date() }],
            function (err, result) {
                if (err) {
                    res.send('-3')  // 服务器查询出错
                    return
                }
                res.send('1')   // 被占用
            })
    })

}

// 获取所有的留言
exports.getallposts = function(req,res){

    var page = req.query.page
    db.findeDB('posts',{},{'pagemount':2,"page":page,"sort":{'datetime':-1}},function(err,result){
        if(err){
             console.log("getallposts err")
              console.log(page)
        }
      
        res.json(result)
        
    })
}

// 获取用户的信息：头像等
exports.getuserinfo = function(req,res){
    var username = req.query.username
    db.findeDB('users',{'username':username},function(err,result){
        if(err){
             console.log("getallposts err")
              console.log(page)
        }

// 加一个对象的原因在于：不让用户的密码暴露出来
        var obj ={
            'username':result[0].username,
            'avatar': result[0].avatar,
            '_id':result[0]._id
        }
        res.json(obj)
    })
}

// 统计留言区的总共帖子数量
exports.postcount = function(req,res){
    db.countDB('posts',function(count){
        res.send(count.toString())
    })
}

// 显示用户的主页
exports.showuser = function(req,res){
    
    var user = req.params['user']
    db.findeDB('posts',{'username':user},function(err,result){
        db.findeDB('users',{'username':user},function(err,result2){
            res.render('user',{
                "username":req.session.username,
                'user':user,
                "login":true,
                'active':'user',
                "posts":result,
                "avatar":result2[0].avatar
            })
        })
    })
}

// 显示用户列表
exports.showuserlist = function(req,res){
    db.findeDB("users",{},function(err,result){
        res.render('userlist',{
            'userlist':result,
            "login":req.session.login == '1' ? true:false,
            "username":req.session.username || '',
            'active': 'userlist'
        })
    })
}

function md5(password) {
    var md = crypto.createHash('md5')
    var tmp = md.update(password).digest('base64')
    return tmp
}