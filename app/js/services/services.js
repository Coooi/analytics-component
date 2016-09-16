(function () {
    'use strict';

    angular.module('analyticsApp')

        .service('ApiService', function ($http, $q) {
            // var analytics = [];
            //
            // //Services
            // return {
            //     getAnalyticsByURL: getAnalyticsByURL
            // };
            //
            // /**
            //  * @ngdoc method
            //  * @name getAnalyticsByURL
            //  * @param {string} url captured from the interface.
            //  *
            //  * @description
            //  * Responsible for fetch website analytics data from the server based on the url parameter.
            //  *
            //  */
            // function getAnalyticsByURL(url) {
            //
            //     var q = $q.defer();
            //
            //     $http({
            //         method: 'GET',
            //         url: url
            //     }).then(handleSuccessResponse, handleErrorResponse);
            //
            //      function handleSuccessResponse (response) {
            //         q.resolve(analytics);
            //     }
            //     function handleErrorResponse (response) {
            //         q.reject({});
            //     }
            //
            //     return q.promise;
            // }


        });
})();