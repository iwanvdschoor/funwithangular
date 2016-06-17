/**
 * @author ivanders
 * @description
 */
'use strict';

describe('gitUsers.module', function() {

	describe('getData', function(){
		// based on the query that is put in the input box, it makes a HTTP call to GIT
		// verify it constructs the correct url
		beforeEach(module('gitUsers'));

		var scope, httpBackend, http, controller;

		beforeEach(inject(function($controller, $rootScope, $httpBackend, $http){ // $rootScope,
			// The injector unwraps the underscores (_) from around the parameter names when matching
			scope = $rootScope.$new();
			httpBackend = $httpBackend;
			controller = $controller;
			http = $http;


			//
			httpBackend.whenJSONP(BASE_API + "/search/users?q=iwan&callback=JSON_CALLBACK").respond({
				data : {
					items : [{
						id : 'something',
						username : 'iwanvdschoor'
					}]
				}
			});
		}));


		describe('$scope.q', function() {
			it(' q', function() {
				// set the query to iwan, and expect 1 result to come back (mocked out above)
				scope.q = 'iwan';

				// run the controller
				controller('UserListController', { $scope: scope, $http : http}); //, $scope, $http, $location
				scope.getData();

				httpBackend.flush();

				expect(scope.users.length).toBe(1);
			});
		});


	});

});