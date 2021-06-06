var app = angular.module('siteBlocker', []);

app.controller('MainController', ['$scope', '$filter', '$interval', '$timeout', 'HelperService', '$http', function ($scope, $filter, $interval, $timeout, HelperService, $http) {

	init();
	const APP_URL = 'http://site-blocker.info/api/';

	function init() {
		var manifest = chrome.runtime.getManifest();
		$scope.appVersion = manifest.version;
		$scope.siteList = [];
		$scope.errorSite = false;
		$scope.newSite = '';
		$scope.removedSite = '';
		$scope.unblockedSite = '';
		$scope.showPassInput = HelperService.getPass();
		$scope.checkbox = {};
		$scope.sortReverse = false;

		$scope.not = {
			list: [],
			show: false,
			read: [],
			unRead: 0
		};


		$scope.checkbox.optionCloseTabs = parseInt(HelperService.getKey('close_option'));

		readStorageConfig();

		$scope.regex = false;

		$scope.errorMessages = {
			maxTags: "Max tags count error",
			patternError: "Invalid tag",
			duplicateTag: "Tag is already exists"
		};

		var times = [];
		for (var i = 0; i < 24; i++) {
			for (var j = 0; j < 60; j += 10) {
				var t = i < 10 ? '0' + i : i;
				var tt = j < 10 ? '0' + j : j;
				times.push(t + ':' + tt);
			}

		}
		$scope.timeRange = times;
		tick();

		function tick() {
			var date = new Date();
			$scope.now = $filter('date')(date, 'HH:mm:ss');
		}

		$interval(tick, 1000);

		$scope.minTime = 0;
		$scope.maxTime = 24;

		var hour_config = HelperService.getKey('hour_config', true, {});

		$scope.hour_config_extra = HelperService.getExtraHour();

		$scope.addExtraTime = function () {
			$scope.hour_config_extra.push({ start: '18:00', end: '21:00' });
		}

		$scope.removeHourItem = function (index) {
			$scope.hour_config_extra.splice(index, 1);
		}

		$scope.redirect_url = localStorage.getItem('redirect_url');
		$scope.currentPage = 'dashboard';


		var loactionHash = document.location.hash.substring(1);


		chrome.runtime.sendMessage({
			method: "getStatus"
		}, function (response) {

			$scope.siteList = response.status ? JSON.parse(response.status) : [];


			if ($scope.siteList.indexOf(loactionHash) != -1) {
				$("#passwordModal").modal();
				focus("#user_password", 1000);
				$scope.removedSite = loactionHash;
			}
			$scope.$apply();
		});
		//attachListener();
		var oneDay = 86400000;
		var lastUpdate = localStorage.getItem('lastUpdate') || 0;
		var now = +(new Date);
		if (now - lastUpdate > oneDay) {
			loadNotifications();
		} else {
			$scope.not.list = HelperService.getKey('notifications', true, []) || [];
			$scope.not = HelperService.getReadMessages($scope.not);

		}

	}

	document.addEventListener('click', function (event) {
		var target = event.target.closest('.notification-li');
		if (!target) {
			$scope.not.show = false;
		}

	})

	//Close modal on background click
	function attachListener() {
		document.addEventListener('click', function (e) {
			if (e.target.className == 'modal') {
				$scope.hideModals();
				$scope.$apply();
			}
		});
	}

	function readStorageConfig() {
		$scope.checkbox.subdomainOption = parseInt(HelperService.getKey('subdomainOption'));
		$scope.checkbox.iframeOption = parseInt(HelperService.getKey('iframeOption'));
		$scope.checkbox.blockKeyOption = parseInt(HelperService.getKey('blockKeyOption'));
		$scope.checkbox.whiteList = parseInt(HelperService.getKey('whiteList')) === 1;
		$scope.blockPattern = localStorage.getItem('blockPattern') || '';
		$scope.blockPatternFlag = localStorage.getItem('blockPatternFlag') || '';


		var list = [];
		var blockKeyList = JSON.parse(HelperService.getKey('blockKeyList')) || [];
		blockKeyList.forEach(function (item) {
			list.push({ key: item })
		});
		$scope.tagList = list;
	}

	$scope.sortList = function () {
		$scope.sortReverse = !$scope.sortReverse;
	};

	$scope.openLink = function () {
		location.href = "https://site-blocker.info";
	}

	$scope.addSite = function () {
		$scope.newSite = $scope.newSite.trim();
		if (!$scope.newSite) {
			$("#custom_site").focus();
			return;
		}
		if (HelperService.isUrl($scope.newSite)) {
			var site_host = HelperService.getHost($scope.newSite);
			if ($scope.siteList.indexOf(site_host) == -1) {
				addSingleSite()
			}
			else {
				alert('Site already exists in blocked list');
				focus('#custom_site', 100);
			}


		}
		else {
			$scope.errorSite = true;
		}
	}

	function addSingleSite() {
		var site = HelperService.getHost($scope.newSite);
		$scope.siteList.push(site);
		$scope.newSite = '';
		$scope.errorSite = false;
	}

	$scope.removeSite = function (site) {
		var _index = HelperService.findIndex($scope.siteList, site);
		if (_index == -1) return;
		$scope.siteList.splice(_index, 1);
	}


	$scope.optionTabsCallback = function (option) {
		option = (option) ? 1 : 0;
		localStorage.setItem('close_option', option);
		$.notify("Changes saved !", { globalPosition: "top right", className: "success" });
	}

	$scope.saveChanges = function () {
		$scope.sitePassword = '';
		if (HelperService.getPass()) {
			$("#passwordModal").modal();
			focus('#user_password', 500);
			return;
		}
		else {
			handleSaving();
		}


	}

	function handleSaving() {
		var sites = JSON.stringify($scope.siteList);
		chrome.runtime.sendMessage({
			method: "save_data",
			value: sites
		}, function (response) {
			if (parseInt(response.status) == 1) {
				$.notify("Changes saved !", { globalPosition: "top right", className: "success" });
			}
			else {
				alert('Error to saving data');
			}

		});
	}

	$scope.saveWithPass = function () {
		if (!$scope.sitePassword) {
			$('#user_password').focus();
			return;
		}
		//TODO: check if password exists
		if (HelperService.md5($scope.sitePassword) == HelperService.getPass()) {

			if ($scope.removedSite) {
				var _index = HelperService.findIndex($scope.siteList, $scope.removedSite);
				if (_index != -1) {
					$scope.siteList.splice(_index, 1);
					$scope.unblockedSite = $scope.removedSite;
					$scope.removedSite = '';
					$scope.sitePassword = '';
					location.hash = '';
				}

			}
			else {
				$scope.hideModals();
			}
			handleSaving();

		}
		else {
			$scope.sitePassword = '';
			focus('#user_password', 50);
			alert('Wrong password');
		}
	}

	$scope.hideAlert = function () {
		$scope.keyError = '';
		$scope.infoKey = '';
	}

	$scope.hideModals = function () {
		$scope.exportSiteList = false;
		$scope.loadSiteList = false;
		$scope.passwordModal = false;
		$scope.hourModal = false;
		$scope.extraConfig = false;
		$scope.synchronizeModal = false;
		$scope.resetPasswordModal = false;
		$scope.hideAlert();
	}


	$scope.showExportModal = function () {
		$scope.exportSiteList = true;
		var data = $scope.siteList.join('\n');
		$scope.exportDataModel = data;

	}

	$scope.showLoadModal = function () {
		$scope.loadSiteList = true;
		$scope.loadDataListModel = '';
		$scope.loadDataResult = [];
	}

	$scope.showHourModal = function () {
		$scope.hourModal = true;
		$scope.hourPasswordModel = '';
		$scope.checkbox.optionHour = parseInt(HelperService.getKey('hour_option'));
		$scope.hourSaved = false;
		$scope.hour_config_extra = HelperService.getExtraHour();
	}

	$scope.showExtraConfigModal = function () {
		readStorageConfig();
		// $scope.extraConfig = true;
		$scope.currentPage = 'extra_config';
		$scope.extraConfigPasswordModel = '';
	}

	$scope.loadSiteDataList = function () {

		$scope.loadDataListModel = $scope.loadDataListModel.trim();
		$scope.loadDataResult = [];

		if ($scope.loadDataListModel.length == 0) {
			$("#site_list").focus();
			return;
		}
		$scope.loadDataArray = $scope.loadDataListModel.split(/\n/);

		$scope.loadDataArray.forEach(function (site) {
			site = site.trim();
			site = HelperService.getHost(site);
			var obj = {
				className: '',
				site: site
			};
			if (!HelperService.isUrl(site)) {
				obj.message = ' is not valid site';
				obj.className = 'not-valid';
				$scope.loadDataResult.push(obj);
				return;
			}

			if ($scope.siteList.indexOf(site) == -1) {
				obj.message = ' added to list';
				obj.className = 'added';
				$scope.siteList.push(site);
			}
			else {
				obj.className = 'exists';
				obj.message = ' already exists in blocked list'

			}
			$scope.loadDataResult.push(obj);
		});


	}


	$scope.setPassword = function () {
		$("#password").focus();
		if (!$scope.userPassword) return;

		if (HelperService.getPass()) {
			var data = prompt('Enter old password');
			if (!data) return;
			if (HelperService.md5(data) != HelperService.getPass()) {
				alert("Wrong password");
				return;
			}
			handlePasswordSaving();

		}
		else {
			handlePasswordSaving();
		}
	}

	$scope.removePassword = function () {
		if (!HelperService.getPass()) return;

		var data = prompt('Enter current password');
		if (!data) return;

		if (HelperService.md5(data) == HelperService.getPass()) {
			removePassword();
			alert("Password removed !");
		} else {
			alert("Wrong Password");
		}


	}

	function removePassword() {
		localStorage.removeItem('pass');
		$scope.showPassInput = HelperService.getPass();
	}

	function handlePasswordSaving() {
		localStorage.setItem('pass', HelperService.md5($scope.userPassword));
		$scope.showPassInput = HelperService.getPass();
		$scope.userPassword = '';
		alert('Password saved!');
	}


	$scope.saveHourChanges = function () {
		$scope.hourSaved = false;
		var _pass = HelperService.getPass();

		if (_pass) {

			if (!$scope.hourPasswordModel) {
				focus('#hour-modal-password', 100);
				return;
			}

			if (HelperService.md5($scope.hourPasswordModel) != _pass) {
				$scope.hourPasswordModel = '';
				alert('Wrong password');
				focus('#hour-modal-password', 100);
				return;
			}
			else {
				handleHourConfigSaving();
			}


		} else {
			handleHourConfigSaving();
		}


	}

	function handleHourConfigSaving() {
		$scope.hourSaved = true;
		$timeout(function () {
			$scope.hourSaved = false;
		}, 1500);
		if ($scope.checkbox.optionHour) {
			localStorage.setItem('hour_option', 1);
			localStorage.setItem('hour_config_extra', JSON.stringify($scope.hour_config_extra));

		}
		else {
			localStorage.setItem('hour_option', 0);
		}
		$scope.hourPasswordModel = '';
	}

	function focus(id, delay) {
		$timeout(function () {
			$(id).focus();
		}, delay);
	}

	$scope.saveExtraConfig = function () {
		var _pass = HelperService.getPass();
		if (_pass) {

			if (!$scope.extraConfigPasswordModel) {
				focus('#extraConfigPassword', 100);
				return;
			}

			if (HelperService.md5($scope.extraConfigPasswordModel) !== _pass) {
				$scope.extraConfigPasswordModel = '';
				alert('Wrong password');
				focus('#extraConfigPassword', 100);
			}
			else {
				handleExtraConfigSaving();
			}


		} else {
			handleExtraConfigSaving();
		}
	}

	function handleExtraConfigSaving() {
		var subdomainOption = $scope.checkbox.subdomainOption ? 1 : 0;
		var iframeOption = $scope.checkbox.iframeOption ? 1 : 0;
		var blockKeyOption = $scope.checkbox.blockKeyOption ? 1 : 0;
		var optionCloseTabs = $scope.checkbox.optionCloseTabs ? 1 : 0;
		var whiteList = $scope.checkbox.whiteList ? 1 : 0;

		var keys = [];
		if (blockKeyOption) {
			keys = $scope.tagList.reduce(function (arr, item) {
				arr.push(item['key']);
				return arr;
			}, []);


			if ($scope.blockPattern) {
				try {
					if (!$scope.blockPatternFlag) {
						(new RegExp($scope.blockPattern)).test('text');
					}
					else {
						(new RegExp($scope.blockPattern, $scope.blockPatternFlag)).test('text');
					}


				} catch (e) {
					//console.log(e);
					alert(e.message);
					return;
				}
			}

		}
		else {
			$scope.blockPattern = '';
			$scope.blockPatternFlag = '';
		}
		localStorage.setItem('blockKeyList', JSON.stringify(keys));
		localStorage.setItem('subdomainOption', subdomainOption);
		localStorage.setItem('iframeOption', iframeOption);
		localStorage.setItem('blockKeyOption', blockKeyOption);
		localStorage.setItem('close_option', optionCloseTabs);
		localStorage.setItem('whiteList', whiteList);
		localStorage.setItem('blockPattern', $scope.blockPattern);
		$scope.blockPatternFlag = $scope.blockPattern ? $scope.blockPatternFlag : '';
		localStorage.setItem('blockPatternFlag', $scope.blockPatternFlag);

		$.notify("Changes Saved !", { globalPosition: "top right", className: "success" });
		$scope.extraConfigPasswordModel = '';

	}

	$scope.synchronizeSaveToDb = function () {
		if (!$scope.keyInput) {
			$scope.keyError = 'Enter key';
			focus('#key_input', 100);
			return;
		}
		//If password set
		if ($scope.showPassInput && HelperService.md5($scope.synchModalPassword) != HelperService.getPass()) {
			$scope.keyError = 'Password is incorrect';
			focus('#synch-modal-password', 100);
			return;
		}
		var url = APP_URL + 'save-data/';
		var data = { key: $scope.keyInput, sites: $scope.siteList };
		var confirmSaving = true;
		if ($scope.siteList.length > 0) {
			confirmSaving = confirm('Do you want to save ' + $scope.siteList.length + ' site ?');
		}

		if (!confirmSaving) {
			return;
		}
		$http
			.post(url, data, { headers: { 'Content-Data-Type': 'json' } })
			.then(function (response) {
				if (response.data.success == 'true' || response.data.success == true) {
					$scope.keyError = '';
					$scope.infoKey = 'Your data saved!';
					handleSynchSuccess();
				} else {
					$scope.keyError = response.data.message;
				}
			}, function (error) {
				$scope.keyError = 'Unable to handle request, try later';
				//console.log(error);
			})

	};

	$scope.synchronizeLoadFromExternal = function () {
		if (!$scope.keyInput) {
			$scope.keyError = 'Enter key';
			focus('#key_input', 100);
			return;
		}
		//If password set
		if ($scope.showPassInput && HelperService.md5($scope.synchModalPassword) != HelperService.getPass()) {
			$scope.keyError = 'Password is incorrect';
			focus('#synch-modal-password', 100);
			return;
		}
		var confirmSaving = confirm('Do you want to load sites fron external? \nYour current list will be overwritten ');
		if (!confirmSaving) {
			return;
		}
		var url = APP_URL + 'get/' + $scope.keyInput;
		$http.get(url)
			.then(function (response) {
				if (response.data.success == 'true' || response.data.success == true) {

					$scope.siteList = response.data.sites || [];
					$scope.keyError = '';
					$scope.infoKey = 'Loaded ' + $scope.siteList.length + ' site from external. Not forget to save';
					handleSynchSuccess();
				} else {
					$scope.keyError = response.data.message;
				}
			}, function (error) {
				$scope.keyError = 'Unable to handle request. Try later';
				////console.log(error);
			})
	}

	function loadNotifications() {
		// Todo change url
		var url = 'https://site-blocker.info/site/notifications';
		$http.get(url).then(function (response) {
			if (response.data) {
				$scope.not.list = response.data || [];
				localStorage.setItem('notifications', JSON.stringify($scope.not.list));
				localStorage.setItem('lastUpdate', +(new Date));
				$scope.not = HelperService.getReadMessages($scope.not);
			}

		})
	}


	$scope.showSynchronizeModal = function () {
		$scope.synchronizeModal = true;
		$scope.keyInput = '';
		$scope.keyError = '';
		$scope.infoKey = '';
	};

	$scope.showSetPasswordModal = function () {
		var status = 'No';
		$scope.userPassword = '';
		if (HelperService.getPass()) {
			status = 'Yes';
		}
	}

	$scope.clearList = function () {
		if (confirm('Clear blockes list ?')) {
			$scope.siteList = [];
		}
	}

	$scope.saveRedirectUrl = function () {

		if (HelperService.isUrl($scope.redirect_url) || !$scope.redirect_url) {
			if ($scope.redirect_url && !$scope.redirect_url.includes('://')) {
				$scope.redirect_url = 'http://' + $scope.redirect_url;
			}
			//Update redirect url value in background
			chrome.runtime.sendMessage({
				method: "update_redirect_url",
				value: $scope.redirect_url
			}, function (response) {
				if (parseInt(response.status) == 1) {
					$.notify("Changes saved !", { globalPosition: "top right", className: "success" });
				}
				else {
					alert('Error to saving data');
				}

			});

		} else {
			alert('Invalid Url');
			focus('#redirect_url', 100);
		}
	}


	function handleSynchSuccess() {
		$scope.synchModalPassword = '';
		$scope.keyInput = '';
	}

	$scope.copyText = function myFunction() {
		var copyText = document.getElementById('exportTxt');
		copyText.select();
		document.execCommand('copy');
		$('#copyText').text('Copied !');
		setTimeout(function () {
			$('#copyText').text('Copy');
		}, 800);
	}

	$scope.setRead = function (id) {
		if (!$scope.not.read.includes(id)) {
			$scope.not.read.push(id);
			// Update notifications
			localStorage.setItem('read', JSON.stringify($scope.not.read));
			$scope.not = HelperService.getReadMessages($scope.not);
		}
	}

}]
);
