function AnalyticsController(ApiService, $log) {
    var $ctrl = this;

    $ctrl.url = 'www.uol.com.br';
    $ctrl.rejectedURL = '';
    $ctrl.showSpinner = false;
    $ctrl.analytics = {};

    $ctrl.getAnalytics = function(){
        $ctrl.showSpinner = true;
        $ctrl.showResults = false;
        if ($ctrl.url) {
            $ctrl.showSpinner = true;
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
        $log.debug(errorResponse);
    }

}

angular.module('analyticsApp').component('analyticsComponent', {
    templateUrl: 'views/analytics_component.html',
    controller: AnalyticsController,
    controllerAs: '$ctrl'
});