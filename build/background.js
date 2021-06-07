var blockedSites = JSON.parse(localStorage.getItem('sites')) || [];
var redirectUrl = localStorage.getItem('redirect_url');
var activeTabs = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	activeTabs[tab.id] = tab;
});

chrome.tabs.onRemoved.addListener(onRemovedListener);

function onRemovedListener(tabId) {
	delete activeTabs[tabId];
}

chrome.tabs.query({}, function (results) {
	results.forEach(function (tab) {
		activeTabs[tab.id] = tab;
	});
})

// this runs before the request and determines if the request needs to be blocked
// add listener has 3 params, callback (the main function), details, which is the urls, and then a filter which tells the events that can be executed by this listener
chrome.webRequest.onBeforeRequest.addListener(
	function (details) {

		blockedSites = JSON.parse(localStorage.getItem('sites')) || [];

		// Do not block main frame request
		if (details.type === 'main_frame') {
			return;
		}

		var tab = activeTabs[details.tabId];
		var host = getLocation(tab.url).host.replace('www.', '');
		var block = false;
		var current_request = getLocation(details.url).host.replace('www.', '');

		if (host !== current_request && blockedSites.indexOf(current_request) > -1) {
			block = true;
		}

		// returning a blocking response, if true then it cancels the request
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/BlockingResponse
		return {
			cancel: block
		};

	},
	{ urls: ["<all_urls>"] },
	['blocking']
);

// this is something that is passed from the frontend, decides if the website should be blocked and then sends a response
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	if (request.host) {

		blockedSites = JSON.parse(localStorage.getItem('sites')) || [];
		blockSubpages = (localStorage.getItem('blockSubpages') || "true") === "true"
		var redirect, blocked;

		// slicing the fullsite to be proper
		fullSite = request.site
		fullSite = fullSite.replace('www.', '');
		fullSite = fullSite.replace('http://', '');
		fullSite = fullSite.replace('https://', '');
		if (fullSite.endsWith('/')){
			fullSite = fullSite.slice(0, -1)
		}

		host = request.value
		
		// to block all subpages use the host (value), to only block this page use the site
		checkingWebsite = blockSubpages ? host : fullSite

		// block all the pages hosted on this base url, request.value
		for (var currSite of blockedSites){
			if (currSite.block == checkingWebsite){
				blocked = true
				redirect = currSite.redirect
				break
			}
		}

		sendResponse({ host: blocked, redirect: redirect });
	}
});

// For option page show all sites
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.method === 'getStatus') {
		sendResponse({ status: localStorage['sites'] });
	}

	else if (request.method === 'save_data') {
		//update data model
		blockedSites = JSON.parse(request.value);
		localStorage.setItem('sites', request.value);
		sendResponse({ status: 1 });

	}
	else if (request.method === 'update_redirect_url') {
		redirectUrl = request.value;
		if (!redirectUrl) {
			localStorage.removeItem('redirect_url');
		} else {
			localStorage.setItem('redirect_url', redirectUrl);
		}
		sendResponse({ status: 1 });
	}

	else sendResponse({});
});

function getLocation(href) {
	var l = document.createElement("a");
	l.href = href;
	return l;
}