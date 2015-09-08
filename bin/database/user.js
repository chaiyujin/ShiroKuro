var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
var userScheMa = new Schema({
    acc: String,
    pwd: String,
    info: String,
    avatar: String,
    articles: [Number]
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
var blogScheMa = new Schema({
    html: String,
    type: String,
    updatedAt: Date,
    blogID: Number
}); //  定义了一个新的模型，但是此模式还未和blogs集合有关联
exports.user = mongoose.model('users', userScheMa); //  与users集合关联
exports.blog = mongoose.model('blogs', blogScheMa); //  与blogs集合关联
exports.db = mongoose.connect('mongodb://172.16.9.187:27017/shiro');
