function AnalyticsController(ApiService, $log) {
    var $ctrl = this;

    $ctrl.url = '';
    $ctrl.rejectedURL = '';
    $ctrl.showSpinner = false;
    $ctrl.summary = {};

    $ctrl.getAnalytics = function(){
        $ctrl.showResults = false;
        if ($ctrl.url) {
            $ctrl.showSpinner = true;
            ApiService.getAnalyticsByURL($ctrl.url).then(handleSuccess, handleError);
        }
    };


    function handleSuccess(designResponse) {

    }
    function handleError(errorResponse) {
        $log.debug(errorResponse);
    }

}

angular.module('analyticsApp').component('analyticsComponent', {
    templateUrl: 'views/analytics_component.html',
    controller: AnalyticsController,
    controllerAs: '$ctrl'
});