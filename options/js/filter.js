(function (app) {
	app.filter('timeFilter', function () {

		return function (hour) {
			return hour + ':00'
		};
	});

})(app);
