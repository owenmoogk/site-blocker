document.getElementById("button").addEventListener('click', testFunc)

function testFunc(){
	chrome.runtime.sendMessage({ message:'20'})
}