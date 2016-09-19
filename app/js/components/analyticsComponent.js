function AnalyticsController(ApiService, $log, $scope) {
    var $ctrl = this,
        POLL_INTERVAL = 3000;

    $ctrl.url = '';
    $ctrl.errorMsg = '';
    $ctrl.analytics = {};
    $ctrl.showSpinner = false;
    $ctrl.progress = 0;

    $ctrl.beginAnalytics = function(){
        if ($ctrl.url) {
            $ctrl.showResults = false;
            $ctrl.showSpinner = true;
            $ctrl.progress = 0;
            $ctrl.errorMsg = '';
            ApiService.getAnalyticsByURL($ctrl.url).then(handleSuccess, handleError);
        }
    };

    function handleSuccess(analyticsResponse) {
        $ctrl.showSpinner = false;
        $ctrl.analytics = analyticsResponse;
        if ($ctrl.analytics.status === 'pending') {
            $ctrl.progress = Math.round($ctrl.analytics.links.verified/ $ctrl.analytics.links.total * 100);
            $ctrl.beginPolling();
        } else {
            $ctrl.showResults = true;
        }
    }
    function handleError(errorResponse) {
        $ctrl.showSpinner = false;
        if (errorResponse.data.message) {
            $ctrl.errorMsg = errorResponse.data.message;
        } else if (errorResponse.data.error) {
            $ctrl.errorMsg = 'Request timeout. This website has too many links, please try another one.';
        }
        $log.debug(errorResponse);
    }

    $scope.$on('newData', function(event, args) {
        $ctrl.analytics = args.data;
        if ($ctrl.analytics.status === 'pending') {
            $ctrl.progress = Math.round($ctrl.analytics.links.verified/ $ctrl.analytics.links.total * 100);
        } else {
            $ctrl.showResults = true;
        }
    });

    $ctrl.beginPolling = function() {
        ApiService.getPollsByUrl($ctrl.url);
    };

}

angular.module('analyticsApp').component('analyticsComponent', {
    templateUrl: 'views/analytics_component.html',
    controller: AnalyticsController,
    controllerAs: '$ctrl'
});