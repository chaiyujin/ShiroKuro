
var removeModal = function () {
	$('body').children('.modal').remove();
	$('body').children('.modal_dialog').remove();
};

var uploadBlog = function () {
	var data = new FormData();
	var file = $('#fileInput')[0].files[0];
	if (file) {
		data.append('filesrc', file);
		$.ajax({
			type: 'post',
			url: '/uploadFile',
			data: data,
			success: function (data) {
				console.log(data);
			}
		})
	}
	return;
};

var addArticleVM = function () {
	var template = "\
	<div class='modal' onclick='removeModal()'></div>\
	<div class='modal_dialog articleBox'>\
		<div class='span8 middle'>\
		<h2>Please select a markdown file.</h2>\
			<form action='/uploadBlogFile' enctype='multipart/form-data' method='post'>\
	            <input class='fileInput' type='file' name='upload' multiple='multiple'>\
	            <input class='buttonInput' type='submit' value='Upload'>\
            </form>\
		</div>\
	</div>";
	$('body').append(template);
}

var viewModel = {
	articles: ko.observableArray([]),
    htmlContent: ko.observableArray(),
    username: ko.observable("Guest"),
    avatarURL: ko.observable("/content/pictures/avatar/default.jpg"),
    introduction: ko.observable("^_^ Shi-Ro"),
    login: ko.observable(false),
    addArticle: addArticleVM,
    message: ko.observable("")
}

// Activates knockout.js
ko.applyBindings(viewModel);

$.ajax({
	type: "POST",
	url: "/blog_home/getData",
	success: function (data) {
	    if (viewModel.login() == false || !viewModel.articles().length) {
			var temp = (viewModel.login() == true)? data.newUser: data.guest;
		    viewModel.htmlContent([temp]);
	    }
	    else {
	        $.ajax({
	            type: "POST",
	            url: "/blog_home/getBlog",
	            data: { data: viewModel.articles()},
	            success: function (data) {
	                console.log(data);
	                viewModel.htmlContent(data);
	            }
	        })
	    }
	}
});
