(function () {
    'use strict';

    angular.module('analyticsApp')

        .service('ApiService', function ($http, $q) {
            var analytics = [],
                ANALYTICS_ENDPOINT = '/analytics/';

            //Services
            return {
                getAnalyticsByURL: getAnalyticsByURL
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


        });
})();