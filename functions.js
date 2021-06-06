function addSite() {
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