var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
var userScheMa = new Schema({
    acc: String,
    pwd: String,
    info: String,
    avatar: String,
    articles: [Number],
    groups: [],
    privilege: Number
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
var blogScheMa = new Schema({
    html: String,
    owners: [String],
    groups: [String],
    tags: [String],
    catalog: String,
    updatedAt: Date,
    blogID: Number
}); //  定义了一个新的模型，但是此模式还未和blogs集合有关联
var cntScheMa = new Schema({
    nextBlogID: Number
}); //  定义了一个新的模型，但是此模式还未和blogs集合有关联
exports.user = mongoose.model('users', userScheMa); //  与users集合关联
exports.blog = mongoose.model('blogs', blogScheMa); //  与blogs集合关联
exports.cnt = mongoose.model('cnts', cntScheMa); //  与blogs集合关联
mongoose.connect('mongodb://127.0.0.1:27017/shiro');
