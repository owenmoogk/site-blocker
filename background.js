// THIS SCRIPT IS RUN IN A ISOLATED ENVIRONMENT, SEPERATE FROM THE DOM

chrome.runtime.onInstalled.addListener(function () {

	// if a tab is updated, send a message to the frontend
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		console.log(changeInfo)
		chrome.tabs.sendMessage(tabId, {message: 'TabUpdated'});
	})

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.message === 'number') {
			console.log('we got a runner')
		}
	})
});