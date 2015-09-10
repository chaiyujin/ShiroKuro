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
var cntDB = require('../bin/database/user.js').cnt;

var userLoginData = {
    username: "Guest",
    avatarURL: templateURL + "default.jpg",
    introduction: "^_^ Shi-Ro",
    articles: [],
    groups: [],
    priviledge: 0,
    login: false
};
var message = "";
/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index');
});

router.post('/login', function (req, res, next) {
    if (!req.session.user && req.body._acc != "" && req.body._pwd != "") {
        console.log(req.body);
        userDB.findOne({acc: req.body._acc, pwd: req.body._pwd}, function (err, docs) {
            if (docs) {
                userLoginData.username = docs.acc;
                userLoginData.avatarURL = templateURL + docs.avatar;
                userLoginData.introduction = docs.info;
                userLoginData.articles = docs.articles;
                userLoginData.groups = docs.groups;
                userLoginData.priviledge = docs.priviledge;
                userLoginData.login = true;
                message = "Login successfully!";
                req.session.user = userLoginData;
            }
            else {
                message = "Fail to login!";
            }
            res.redirect(req.body._from);
        });
    }
    else {
        message = "Fail to login!";
        res.redirect(req.body._from);
    }
});

router.post('/changePassword', function (req, res, next) {
    if (req.body._new != req.body._confirm) {
        message = "New password not confirmed!";
        res.redirect(req.body._from);
    }
    else {
        userDB.update({ acc: userLoginData.username, pwd: req.body._old }, {
            $set: { pwd: req.body._new }
        }, function (err, docs) {
            if (docs.n > 0) message = "Change successfully!";
            else 
                message = "Wrong old password!";
            if (err) {
                message = "Database error!";
            }
            res.redirect(req.body._from);
        });
    }
});

router.get('/home', function (req, res, next) {
    res.render('index');
})

router.get('/blog_home', function (req, res, next) {
    authentication(req, res);
    console.log(req.session.user);
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
                ret.push(docs[i]);
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
    var form = new formidable.IncomingForm();
    var post = {}, file = {};
    var tmpPath = __dirname + '/../public/content/tmp';
    form.uploadDir = tmpPath;  //文件上传 临时文件存放路径 

    form.parse(req, function (error, fields, files) {
        var types = files.upload.name.split('.');
        var type = String(types[types.length - 1]);
        var date = new Date();
        var ms = Date.parse(date);
        var filename = tmpPath + "/files" + ms + "." + type;
        fs.renameSync(files.upload.path, filename);
        if (type.length > 0 && type == "md") {
            var fileContent = fs.readFileSync(filename, 'utf8');
            var html = converter.makeHtml(fileContent).replace(/(\n)+|(\r\n)+/g, "");
            fs.unlinkSync(filename);
            message = "Successfully " + fields['param'] + " article.";
            if (fields['_param'] == 'add') {
                addBlog(req, res, html, "blog", fields['_from']);
            }
            else if (fields['_param'] == 'modify') {
                modifyBlog(req, res, html, fields['_id'], fields['_from']);
            }
        }
        else {
            fs.unlinkSync(filename);
            message = "Fail to " + fields['_param'] + " article.";
            res.redirect(fields['_from']);
        }
    });
});

router.post('/uploadAvatarFile', function (req, res, next) {
    var form = new formidable.IncomingForm();
    var post = {}, file = {};
    var tmpPath = __dirname + '/../public/content/pictures/avatar';
    form.uploadDir = tmpPath;  //文件上传 临时文件存放路径 

    form.parse(req, function (error, fields, files) {
        var types = files.upload.name.split('.');
        var type = String(types[types.length - 1]);
        var date = new Date();
        var ms = Date.parse(date);
        var filename = tmpPath + "/" + fields['_acc'] + "." + type;
        fs.renameSync(files.upload.path, filename);
        if (type.length > 0 && (type == "jpg" || type == "png" || type == "bmp")) {
            userDB.update({ acc: fields['_acc'] }, {
                $set: { avatar: fields['_acc'] + "." + type }
            }, function (err, docs) {
                if (docs.n > 0) {
                    message = "Change successfully!";
                    userLoginData.avatarURL = templateURL + fields['_acc'] + "." + type;
                    req.session.user = userLoginData;
                }
                else
                    message = "Fail to change!";
                if (err) {
                    message = "Database error!";
                }
                res.redirect(fields['_from']);
            });
        }
        else {
            fs.unlinkSync(filename);
            message = "Not picture file.";
            res.redirect(fields['_from']);
        }
    });
});

router.post('/deleteBlogFile', function (req, res, next) {
    for (var i = 0; i < userLoginData.articles.length; i++) {
        if (userLoginData.articles[i] == req.body._id) {
            userLoginData.articles.splice(i, 1); i--;
            break;
        }
    }
    req.session.user = userLoginData;
    userDB.update({ acc: userLoginData.username }, {
        $set: { articles: userLoginData.articles }
    }, function (err, docs) {
        if (docs.n > 0)
            message = "Delete successfully!";
        else 
            message = "Fail to delete!";
        if (err) {
            message = "Database error!";
        }
        res.redirect(req.body._from);
    });
});

function addBlog(req, res, html, type, from) {
    cntDB.find({}, function (err, doc) {
        console.log(doc);
        var count = doc[0].nextBlogID;
        cntDB.update({nextBlogID: count}, {$set: {nextBlogID: count + 1}}, function (err, docs) {
            var blogTuple = {
                html: html,
                owners: [userLoginData.username],
                groups: [],
                tags: [],
                catalog: 'blog',
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
                    res.redirect(from);
                }
            });
            var blogEntity = new blogDB(blogTuple);
            blogEntity.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect(from);
                }
            });
            res.redirect(from);
        });
    });
}

function modifyBlog(req, res, html, id, from) {
    console.log(id);
    blogDB.update({ blogID: id }, {
        $set: { html: html }
    }, function (err, docs) {
        if (docs.n > 0)
            message = "Modify successfully!";
        else 
            message = "Fail to modify!";
        if (err) {
            message = "Database error!";
        }
        res.redirect(from);
    });
}

module.exports = router;
