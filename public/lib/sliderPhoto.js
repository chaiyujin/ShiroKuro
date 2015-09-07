var formulate = function (template, cxt) {
	for (var idx in cxt) {
		reg = new RegExp("\{" + idx + "\}", "g");
		return template.replace(reg, cxt[idx]);
	}
}

var randInt = function (range) {
	return Math.floor(Math.random() * range);
}

$(document).ready(function () {
	var h = 300, w = 300;
	var imgArray = ["/content/pictures/1.jpg", "/content/pictures/2.jpg", "/content/pictures/3.jpg"];
	var changeFunc = ["SlideDown", "SlideRandom", "FadeOut"],
		funcCur = 0, funcCnt = 3;
	var imgCur = 0,
		imgCnt = 3;
	var template = "<div class='innerCube' id='inner_old' style='background-position: {bkPos}; display: none; opacity: 0;'></div>\
					<div class='innerCube' id='inner_new' style='background-position: {bkPos}; opacity: 1;'></div>";

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 3; j++) {
			var idx = 'cube_' + i + '_' + j;
			var cxt = { bkPos: (0 - i * w) + 'px ' + (0 - j * h) + 'px' }
			$("div#pictureBox").append("<div class='cube' id='" + idx + "'></div>");
			$("div#" + idx).css("left", i * w);
			$("div#" + idx).css("top", j * h);
			$("div#" + idx).append(formulate(template, cxt));
		}
	}

	setInterval(function () {
		imgCur++; funcCur++;
		if (imgCur == imgCnt) imgCur = 0;
		if (funcCur == funcCnt) funcCur = 0;
		resetCube();
		changeImage(imgCur, changeFunc[funcCur]);
	}, 3000);

	function resetCube () {
		$(".cube").each(function () {
			$(this).find("#inner_old").css("background-image", $(this).find("#inner_new").css("background-image"));
			$(this).find(".innerCube")
				.css("opacity", 1).css("display", "block")
				.css("left", 0).css("top", 0)
				.css("height", 299).css("width", 299);
		});
	}

	function changeImage (imgIdx, fnc) {
		var img = "url('" + imgArray[imgIdx] + "')";
		var func = "transitionAnimation" + fnc +"(\"" + img + "\")";
		eval(func);
	}

	function transitionAnimationSlideDown (img) {
		$(".cube").each(function () {
			var x = Math.round(parseFloat($(this).css("top")) / h);
			var y = Math.round(parseFloat($(this).css("left")) / w);
			$(this).find("#inner_new")
				.css("top", -h)
				.css("opacity", 0)
				.css("background-image", img)
				.delay((x + y) * 50)
				.animate({top: 0, opacity: 1}, 300);
			$(this).find("#inner_old")
				.delay((x + y) * 50)
				.animate({top: h, opacity: 0}, 300, function () {
					$(this).css("display", "none");
				});
		});
	}

	function transitionAnimationSlideRandom (img) {
		function getAttr(type) {
			switch (type) {
				case 0: return "top";
				case 1: return "left";
				case 2: return "right";
				case 3: return "bottom";
			}
		}
		function getLen(type) {
			switch (type) {
				case 0:
				case 3: return h;
				case 1:
				case 2: return w;
			}
		}
		$(".cube").each(function () {
			var x = 0;
			var y = randInt(10);
			var type = randInt(4);
			var targetNew = { opacity: 1 };
			var targetOld = { opacity: 0 };
			targetNew[getAttr(type)] = 0;
			targetOld[getAttr(type)] = getLen(type);
			$(this).find("#inner_new")
				.css(getAttr(type), -getLen(type))
				.css("opacity", 0)
				.css("background-image", img)
				.delay((x + y) * 50)
				.animate(targetNew, 300);
			$(this).find("#inner_old")
				.delay((x + y) * 50)
				.animate(targetOld, 300, function () {
					$(this).css("display", "none");
				});
		});
	}

	function transitionAnimationFadeOut(img) {
		$(".cube").each(function () {
			var x = 0;
			var y = randInt(10);
			$(this).find("#inner_new")
				.css("opacity", 0)
				.css("background-image", img)
				.delay((x + y) * 50)
				.animate({opacity: 1}, 300);
			$(this).find("#inner_old")
				.delay((x + y) * 50)
				.animate({opacity: 0}, 300, function () {
					$(this).css("display", "none");
				});
		});
	}
});