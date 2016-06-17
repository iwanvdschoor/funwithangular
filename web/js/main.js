'use strict';

var gitUsers = angular.module('gitUsers',['ngRoute']),
	BASE_API = "https://api.github.com";


/**
 * configures the router to show different partials based on the route
 */
gitUsers.config(['$locationProvider', '$routeProvider',
	function config($locationProvider, $routeProvider) {
		$locationProvider.hashPrefix('!');

		$routeProvider.
			when('/', {
				templateUrl: "partials/searchuser.html"
			}).
			when('/edituser/:userId', {
				templateUrl: "partials/edituser.html"
			});
	}
]);

/**
 * Controller that stores the GIST data on GitHub and in sessionStorage
 */
gitUsers.controller('UserGistController', function UserGistController($scope, $routeParams, $http, $window){
	// passing in the $window service instead of using sessionStorage global, so it can be easily tested / mocked out.

	// sets the userId based on the route params
	$scope.userId = $routeParams.userId;

	// onload, load the variables into the $scope.formData
	var localGist = $window.sessionStorage.getItem($scope.userId);

	if (localGist){		// is there data for this user in sessionStorage alraedy?

		localGist = JSON.parse(localGist);  // since session storage stores strings only.. JSON.parse this

		$scope.formData = {
			description : localGist.description || "",
			content  : localGist.files["file1.txt"].content
		};

	}

	/**
	 * saves the Gist to GitHub, and in sessionStorage.
	 */
	$scope.saveGist = function saveGist(){

		// data structure for GIT GISTS:
		var data = {
			"description": $scope.formData.description,
			"public": true,
			"files": {
				"file1.txt": {
					"content": $scope.formData.content
				}
			}
		};

		// sessionStorage is synchronous
		$window.sessionStorage.setItem($scope.userId, JSON.stringify(data));

		// after the gist is succesfully saved to GIT, update sessionStorage to have the gistId
		$http.post(BASE_API + "/gists", data).then(function success(json){

			var gitResp = json.data;

			// update the local version of the GIST content in sessionStorage to store the gist id.
			// intentionally using the get / setItem apis instead of direct access for testability.
			var localCacheData = JSON.parse($window.sessionStorage.getItem($scope.userId));
				localCacheData.gistId = gitResp.id;

			$window.sessionStorage.setItem($scope.userId, JSON.stringify(localCacheData));

			// on success, set success message
			$scope.message = "Gist data saved";

		}, function failure(error){

			// on failure, show error to user
			$scope.message = "Gist data not saved to GitHub";

		});
	}
});


/**
 * List controller that takes input from the query box to grab the list of users from GitHub
 *
 */
gitUsers.controller('UserListController', function UserListController($scope, $http, $location){

	// HTTP CALLS: https://api.github.com/users/iwanvdschoor
	$scope.users = [];

	$scope.user = "";

	// redirects to the edit url -> GistController
	$scope.editUser = function editUser(user){
		console.log(user);
		var url = '/edituser/' + user;

		$scope.user = user;
		$location.path(url);		// change the url to the user specific url, and let ngRouter handle it from there
	};

	// gets the data off of GitHub
	$scope.getData = function getData(){

		$http.jsonp(BASE_API + "/search/users?q=" + $scope.q + "&callback=JSON_CALLBACK")
			.then(function(json) {
				// need to do some validation here in case this API fails
				$scope.users = json.data.data.items;
			});
	};

});