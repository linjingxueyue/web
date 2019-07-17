/**
 *       这个模块封装了所有对数据库的常用操作
 * 
 *   每次不管数据库什么操作，都是先连接数据库，我们可以把它封装为函数
 * 
 */

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/';
var client = new MongoClient(url);

function __connectDB(callback) {
    //连接数据库
    client.connect(function (err) {
        var db = client.db('shuoshuo');
        callback(err, db)

    });
}

// 插入数据
exports.insertDB = function (collectionname, json, callback) {
    // 连接成功做的事情
    __connectDB(function (err, db) {
        if (err) {
            showError("连接数据库失败", callback)
            return
        }
        db.collection(collectionname).insertMany(json, function (err, result) {
            if (err) {
                showError("添加数据失败", callback)
                return
            }
            callback(null, result);
        });
    })

}
// 查找与分页显示
exports.findeDB = function (collectionname, json, c, d) {
    if (arguments.length == 3) {
        var callback = c;
        var args = { "pagemount": 0, "page": 0 }
    }
    else if (arguments.length == 4) {
        var args = c;
        var callback = d
        console.log("ddddddddddddddddddddddddddd")
    }
    else {
        throw new Error("参数个数发生错误..............")
    }
    __connectDB(function (err, db) {

        if (err) {
            showError("连接数据库失败", callback)
            return
        }
        var limit = args.pagemount || 0   // 页的容量
        var page = args.page || 0           // 页码
        var page = limit * (page - 1)
        var sort = args.sort || {}
        db.collection(collectionname).find(json).limit(limit).skip(page).sort(sort).toArray(function (err, docs) {
            if (err) {
                showError("Found error..............", callback)
                return
            }
            callback(null, docs)
        })
    })
}

// 删除
exports.delMany = function(collectionname,json,callback){
    __connectDB(function(err,db){
        if (err) {
            showError("连接数据库失败", callback)
            return
        }
        db.collection(collectionname).deleteMany(json,function(err,results){
            if(err){
                showError("删除失败-------------------",callback)
                return
            }
            callback(null,results)
        })
    })
}
// 更新
exports.updateDB = function(collectionname,json1,json2,callback){
    __connectDB(function(err,db){
        if (err) {
            showError("连接数据库失败", callback)
            return
        }
        db.collection(collectionname).updateMany(json1,json2,function(err,result){
            if(err){
                showError("更新失败",callback)
                return
            }
            callback(null,result)
        })
    })
}

// 计数
exports.countDB = function(collectionname,callback){
    __connectDB(function(err,db){
        if (err) {
            showError("连接数据库失败", callback)
            return
        }
       db.collection(collectionname).count().then(function(count){
            callback(count)
       })
    })
}


function showError(err, callback) {
    callback(err, null)
}

client.close()