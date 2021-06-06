chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
	if (msg.action) location.reload();
});

// data and callback here
chrome.extension.sendRequest(
	{
		host: 'site',
		value: window.location.host.replace('www.', ''),
		site: location.href
	},
	function (response) {
		if (response.host === true) {
			block_site();
		}
	}
);

// when the site is blocked it will redirect to another page
function block_site() {
	window.stop();
	window.location.replace('https://janik.codes')
}



