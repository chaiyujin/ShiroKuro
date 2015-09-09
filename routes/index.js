var express = require('express');
var router = express.Router();
var	fileContent;
var fs = require('fs');
var showdown  = require('showdown'),
    converter = new showdown.Converter();
var formidable = require('formidable'),
    sys = require('sys');

var templateURL = "/content/pictures/avatar/";
var userDB = require('../bin/database/user.js').user;
var blogDB = require('../bin/database/user.js').blog;
var userTuple = {
    acc: "",
    pwd: "",
    info: "",
    avatar: "",
    articles: []
};
var userLoginData = {
    username: "Guest",
    avatarURL: templateURL + "default.jpg",
    introduction: "^_^ Shi-Ro",
    articles: [],
    login: false
};
var message = "";
/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index');
});

router.post('/login', function (req, res, next) {
    if (!req.session.user && req.body._acc != "" && req.body.pwd != "") {
        userDB.findOne({acc: req.body._acc, pwd: req.body._pwd}, function (err, docs) {
            if (docs) {
                userLoginData.username = docs.acc;
                userLoginData.avatarURL = templateURL + docs.avatar;
                userLoginData.introduction = docs.info;
                userLoginData.articles = docs.articles;
                userLoginData.login = true;
                req.session.user = userLoginData;
            }
            res.redirect(req.body._from);
        });
    }
    else {
        res.redirect(req.body._from);
    }
});

router.get('/home', function (req, res, next) {
    res.render('index');
})

router.get('/blog_home', function (req, res, next) {
    authentication(req, res);
    res.render('blog_home', { userLoginData: userLoginData, message: message }, function (err, html) {
        message = "";
        res.send(html);
    });
});

router.get('/cg_home', function (req, res, next) {
	res.render('cg_home');
});

router.get('/acg_home', function (req, res, next) {
	res.render('acg_home');
});

router.get('/draw_home', function (req, res, next) {
	res.render('draw_home');
});

router.post('/blog_home/getData', function(req, res, next) {
	var fileContent0 = fs.readFileSync('./public/md_template/Guest.md', 'utf8');
	var html0 = converter.makeHtml(fileContent0);
    var fileContent1 = fs.readFileSync('./public/md_template/NewUser.md', 'utf8');
    var html1 = converter.makeHtml(fileContent1);
	var data = {
		guest: html0.replace(/(\n)+|(\r\n)+/g, ""),
        newUser: html1.replace(/(\n)+|(\r\n)+/g, "")
	}
	res.json(data);
});

router.post('/blog_home/getBlog', function (req, res, next) {
    var articles = req.body["data[]"];
    var ret = [];
    blogDB.find({ blogID: { $in: articles } }, function (err, docs) {
        if (err) { return; }
        if (docs) {
            for (var i = docs.length - 1; i >= 0; i--) {
                ret.push(docs[i].html);
            }
            res.send(ret);
        }
    });
});

function authentication (req, res) {
    if (!req.session.user) {
        userLoginData.login = false;
    }
    else {
        userLoginData.login = true;
        userLoginData = req.session.user;
    }
}

router.post('/uploadBlogFile', function (req, res, next) {
    console.log("hehe");
    var form = new formidable.IncomingForm(); 
    var post = {}, file = {};
    var tmpPath = __dirname + '/../public/content/tmp';
    form.uploadDir = tmpPath;  //文件上传 临时文件存放路径 

    form.parse(req, function (error, fields, files) {
        console.log(fields);
        var types = files.upload.name.split('.');
        var type = String(types[types.length-1]);
        var date = new Date();
        var ms = Date.parse(date);
        var filename = tmpPath + "/files" + ms + "." + type;
        fs.renameSync(files.upload.path, filename);
        if (type.length > 0 && type=="md") {
            var fileContent = fs.readFileSync(filename, 'utf8');
            var html = converter.makeHtml(fileContent).replace(/(\n)+|(\r\n)+/g, "");
            fs.unlinkSync(filename);
            message = "Successfully add article.";
            addBlog(req, res, html, "blog");
        }
        else {
            fs.unlinkSync(filename);
            message = "Fail to add article.";
            res.redirect('/blog_home');
        }
    });
});

function addBlog(req, res, html, type) {
    blogDB.count({}, function (err, count) {
        var blogTuple = {
            html: html,
            type: type,
            updatedAt: new Date(),
            blogID: count
        }
        userLoginData.articles.push(count);
        req.session.user = userLoginData;
        userDB.update({ acc: userLoginData.username }, {
            $push: { articles: count }
        }, function (err, docs) {
            if (err) {
                console.log(err);
                res.redirect('/blog_home');
            }
        });
        var blogEntity = new blogDB(blogTuple);
        blogEntity.save(function (err) {
            if (err) {
                console.log(err);
                res.redirect('/blog_home');
            }
        });
        res.redirect('/blog_home');
    });
}

module.exports = router;
