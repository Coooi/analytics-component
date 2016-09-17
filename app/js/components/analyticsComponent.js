function AnalyticsController(ApiService, $log) {
    var $ctrl = this;

    $ctrl.url = '';
    $ctrl.errorMsg = '';
    $ctrl.showSpinner = false;
    $ctrl.analytics = {};

    $ctrl.getAnalytics = function(){
        if ($ctrl.url) {
            $ctrl.showSpinner = true;
            $ctrl.showSpinner = true;
            $ctrl.showResults = false;
            $ctrl.errorMsg = '';
            ApiService.getAnalyticsByURL($ctrl.url).then(handleSuccess, handleError);
        }
    };

    function handleSuccess(analyticsResponse) {
        $ctrl.showSpinner = false;
        $ctrl.showResults = true;
        $ctrl.analytics = analyticsResponse;
    }
    function handleError(errorResponse) {
        $ctrl.showSpinner = false;
        if (errorResponse.data) {
            $ctrl.errorMsg = errorResponse.data.message;
        }
        $log.debug(errorResponse);
    }

}

angular.module('analyticsApp').component('analyticsComponent', {
    templateUrl: 'views/analytics_component.html',
    controller: AnalyticsController,
    controllerAs: '$ctrl'
});