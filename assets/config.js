require.config({baseUrl: "modules"});
require(["dashboard", "moment.min"], function (dashboard, moment) {
	window.dashboard = dashboard;
	window.moment    = moment;
});