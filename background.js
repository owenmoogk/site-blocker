chrome.runtime.onInstalled.addListener(function() {
	// ...
  
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	  // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
	  // status is more reliable (in my case)
	  // use "alert(JSON.stringify(changeInfo))" to check what's available and works in your case
	  if (changeInfo.status === 'complete') {
		chrome.tabs.sendMessage(tabId, {
		  message: 'TabUpdated'
		});
	  }
	})
  });
  	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.message === 'number') {
			console.log('we got a runner')
		}
	})
});