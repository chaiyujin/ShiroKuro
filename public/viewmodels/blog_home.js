var AppViewModel = {
    htmlContent: ko.observable("<h1>Loading...</h1>"),
    username: ko.observable("Guest"),
    avatarURL: ko.observable("/content/pictures/avatar/default.jpg"),
    introduction: ko.observable("^_^ Shi-Ro"),
    login: ko.observable(false)
}

// Activates knockout.js
ko.applyBindings(AppViewModel);

$.ajax({
	type: "POST",
	url: "/blog_home/getData",
	success: function (data) {
	    AppViewModel.htmlContent(data.cxt);
		console.log(data);
	}
});