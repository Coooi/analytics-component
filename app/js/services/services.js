(function () {
    'use strict';

    angular.module('analyticsApp')

        .service('ApiService', function ($http, $rootScope, $interval, $q, $log) {
            var analytics = [],
                ANALYTICS_ENDPOINT = '/analytics/',
                POLL_ENDPOINT = 'poll/';

            //Services
            return {
                getAnalyticsByURL: getAnalyticsByURL,
                getPollsByUrl: getPollsByUrl
            };

            /**
             * @ngdoc method
             * @name getAnalyticsByURL
             * @param {string} url captured from the interface.
             *
             * @description
             * Responsible for fetch website analytics data from the server based on the url parameter.
             *
             */
            function getAnalyticsByURL(url) {

                var q = $q.defer(),
                    requestURL = ANALYTICS_ENDPOINT + window.encodeURIComponent(url);

                $http({
                    method: 'GET',
                    url: requestURL
                }).then(handleSuccessResponse, handleErrorResponse);

                 function handleSuccessResponse (response) {
                     analytics = response.data;
                    q.resolve(analytics);
                }
                function handleErrorResponse (errorResponse) {
                    q.reject(errorResponse);
                }

                return q.promise;
            }

            function getPollsByUrl(url) {

                var requestURL = ANALYTICS_ENDPOINT + POLL_ENDPOINT + window.encodeURIComponent(url);

                var polls = $interval(function() {
                    return $http.get(requestURL).then(handleSuccessPollsResponse, handleErrorPollsResponse);
                }, 4000);

                function handleSuccessPollsResponse (response) {
                    analytics = response.data;
                    $rootScope.$broadcast('newData', { data: analytics });
                    if (analytics.status === 'complete') {
                        $interval.cancel(polls);
                    }
                }
                function handleErrorPollsResponse (errorResponse) {
                    $log.error(errorResponse);
                }
            }


        });
})();