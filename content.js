chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message === 'TabUpdated') {
		if (document.location.href == "https://www.youtube.com/"){
			window.location.replace("https://www.youtube.com/feed/subscriptions")
		}
	}
})
