var len = 0;
if(localStorage.sites != undefined) len = JSON.parse(localStorage.sites).length;
document.getElementById('count').innerHTML = len;
