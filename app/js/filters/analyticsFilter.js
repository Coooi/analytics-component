angular.module('analyticsApp').filter('yes_no', function () {
    return function (answer) {
        return answer ? "Yes" : "No";
    };
});