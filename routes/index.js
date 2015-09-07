var express = require('express');
var router = express.Router();
var	fileContent;
var fs = require('fs');
var showdown  = require('showdown'),
    converter = new showdown.Converter();

var userLoginData = {
    username: "Guest",
    avatarURL: "/content/pictures/avatar/default.jpg",
    introduction: "^_^ Shi-Ro",
    login: false
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.post('/login', function (req, res, next) {
    if (!req.session.user && req.body._acc != "") {
        req.session.user = {
            username: req.body._acc
        }
    }
    res.redirect(req.body._from);
});

router.get('/home', function (req, res, next) {
    res.render('index');
})

router.get('/blog_home', function (req, res, next) {
    authentication(req, res);
    res.render('blog_home', { userLoginData: userLoginData });
});

router.get('/cg_home', function(req, res, next) {
	res.render('cg_home');
});

router.get('/acg_home', function(req, res, next) {
	res.render('acg_home');
});

router.get('/draw_home', function(req, res, next) {
	res.render('draw_home');
});

router.post('/blog_home/getData', function(req, res, next) {
	fileContent = fs.readFileSync('test.md', 'utf8');
	var html = converter.makeHtml(fileContent);
	var data = {
		cxt: html.replace(/(\n)+|(\r\n)+/g, "")
	}
	fs.writeFileSync('test.html', html);
	res.json(data);
});

function authentication(req, res) {
    if (!req.session.user) {
        userLoginData.login = false;
    }
    else {
        userLoginData.login = true;
        userLoginData.username = req.session.user.username;
    }
}

module.exports = router;
