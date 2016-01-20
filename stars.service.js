(function() {
	'use strict';

	angular
		.module('app')
		.factory('StarsService', StarsService);

	StarsService.$inject = ['$http'];
	function StarsService($http) {
		var service = {};
		var stars; 

		service.getAll = getAll;

		return service;

		function getAll() {
			if (!stars) {
				stars = $http.get('http://star-api.herokuapp.com/api/v1/stars').then(handleSuccess, handleError('Error accessing API'));
			}
			return stars;
		}

		function handleSuccess(response) {
			console.log(response);
			return response.data;
		}

		function handleError(error) {
			return {success: false, message: error};
		}
	}
})();