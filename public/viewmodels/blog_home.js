var AppViewModel = {
    firstName: ko.observable("<h1>aaaaaaa</h1>"),
}
// Activates knockout.js
ko.applyBindings(AppViewModel);

$.ajax({
	type: "POST",
	url: "/blog_home/getData",
	success: function (data) {
		AppViewModel.firstName(data.cxt);
		console.log(data);
	}
});