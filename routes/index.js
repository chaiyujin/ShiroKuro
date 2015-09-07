var express = require('express');
var router = express.Router();
var	fileContent;
var fs = require('fs');
var showdown  = require('showdown'),
    converter = new showdown.Converter();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.get('/blog_home', function(req, res, next) {
	res.render('blog_home');
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

module.exports = router;
