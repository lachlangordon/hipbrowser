(function() {
	'use strict';

	angular
		.module('app', ['ngRoute'])
		.config(config);

	config.$inject = ['$routeProvider', '$locationProvider'];
	function config($routeProvider, $locationProvider) {
		$routeProvider
			.when('/star/:hipnum', {
				controller: 'StarController',
				templateUrl: 'star.view.html',
				controllerAs: 'vm'
			})
			.when('/', {
                controller: 'HomeController',
                templateUrl: 'home.view.html',
                controllerAs: 'vm'
            })
            .otherwise({ redirectTo: '/' });

	}
})();