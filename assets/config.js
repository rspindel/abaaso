require.config({
	baseUrl : "modules",
	paths   : {
		"moment" : "moment.min"
	}
});
require(["dashboard", "moment"], function (dashboard, moment) {
	window.dashboard = dashboard;
	window.moment    = moment;
});