require.config({baseUrl: "modules"});
require(["dashboard", "moment.min"], function (dashboard) {
	window.dashboard = dashboard;
});