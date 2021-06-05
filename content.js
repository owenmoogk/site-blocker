// THIS IS RUN EVERY TIME CHROME LOADS A PAGE WHICH MATCHES THE 'MATCHES' IN MANIFEST

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	// if we recieve a message that a tab has been updated and it equals the link, then redirect
	if (request.message === 'TabUpdated') {
		if (document.location.href == "https://www.youtube.com/" || document.location.href == "https://www.youtube.com") {
			window.location.replace("https://www.youtube.com/feed/subscriptions")
		}
	}

})
