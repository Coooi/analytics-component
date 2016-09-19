(function(){
    'use strict';
    var AppDependencies = [
        'angular-svg-round-progressbar'
    ];

    angular
        .module('analyticsApp', AppDependencies)

        .config(AppConfiguration);

    function AppConfiguration($locationProvider, $sceProvider) {

        $sceProvider.enabled(false);

        var urlProperties = {enabled: true, requireBase: true};

        $locationProvider.html5Mode(urlProperties).hashPrefix('!');
    }
})();

