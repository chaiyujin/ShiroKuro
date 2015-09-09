
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

var addArticleVM = function (op, id, from) {
	var template = "\
	<div class='modal' onclick='removeModal()'></div>\
	<div class='modal_dialog articleBox'>\
		<div class='span8 middle'>\
		<h2>Please select a markdown file.</h2>\
			<form action='/uploadBlogFile' enctype='multipart/form-data' method='post'>\
	            <input class='fileInput' type='file' name='upload' multiple='multiple'>\
	            <input class='textInput none' type='text' name='_param' value='" + op + "'/>\
	            <input class='textInput none' type='text' name='_id' value='" + id + "'/>\
	            <input class='textInput none' type='text' name='_from' value='" + from + "'/>\
	            <input class='buttonInput' type='submit' value='" + op + "'>\
            </form>\
		</div>\
	</div>";
	$('body').append(template);
}

var deleteArticleVM = function (id, from) {
	if (id < 0) return;
	console.log(from);
	var template = "\
	<div class='modal' onclick='removeModal()'></div>\
	<div class='modal_dialog articleBox'>\
		<div class='span8 middle'>\
		<h2>Confirm to delete this blog?</h2>\
			<form action='/deleteBlogFile' method='post'>\
	            <input class='textInput none' type='text' name='_id' value='" + id + "'/>\
	            <input class='textInput none' type='text' name='_from' value='" + from + "'/>\
	            <input class='buttonInput' type='submit' value='Yes'>\
            </form>\
		</div>\
	</div>";
	$('body').append(template);
}

var changePassword = function () {
	var template = "\
	<div class='modal' onclick='removeModal()'></div>\
	<div class='modal_dialog articleBox'>\
		<div class='span8 middle'>\
		<h2>Change Password</h2>\
			<form action='/changePassword'  method='post'>\
				<input class='textInput' type='Password' name='_old' placeholder='Old password'/>\
				<input class='textInput' type='Password' name='_new' placeholder='New password'/>\
				<input class='textInput' type='Password' name='_confirm' placeholder='Confirm'/>\
				<input class='textInput none' type='text' name='_from' value='/blog_home'/>\
	            <input class='buttonInput' type='submit' value='Change'/>\
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
    deleteArticle: deleteArticleVM,
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
		    viewModel.htmlContent([{html: temp, id: -1}]);
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
