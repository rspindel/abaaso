require.config({baseUrl: "modules"});
require(["dashboard"], function (dashboard) {
	window.dashboard = dashboard;
});