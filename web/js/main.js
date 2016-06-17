'use strict';

var gitUsers = angular.module('gitUsers',['ngRoute']),
	BASE_API = "https://api.github.com";


// Define the `PhoneListController` controller on the `phonecatApp` module

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


gitUsers.controller('UserGistController', function UserGistController($scope, $routeParams, $http, $window){

	// passing in the $window service instead of using sessionStorage global, so it can be easily tested / mocked out.

	// sets the userId based on the route params
	$scope.userId = $routeParams.userId;

	// onload, load the variables into the $scope.formData
	var localGist = $window.sessionStorage.getItem($scope.userId);

	if (localGist){		// is there data for this user in sessionStorage alraedy?

		localGist = JSON.parse(localGist);  // since session storage stores strings only.. JSON.parse this

		$scope.formData = {
			description : localGist.description,
			content  : localGist.files["file1.txt"].content
		};

	}

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

			// update the local version of the GIST content to store the gist id.

			var localCacheData = JSON.parse($window.sessionStorage.getItem($scope.userId)).gistId = gitResp.id;
			$window.sessionStorage.setItem($scope.userId, JSON.stringify(localCacheData));

			// on success, set success message
			$scope.message = "Gist data saved";

		}, function failure(error){

			$scope.message = "Gist data not saved to GitHub";

		});

	}



});

gitUsers.controller('UserListController', function UserListController($scope, $http, $location){

	// HTTP CALLS: https://api.github.com/users/iwanvdschoor
	$scope.users = [];

	$scope.user = "";


	$scope.editUser = function editUser(user){
		console.log(user);
		var url = '/edituser/' + user;

		$scope.user = user;
		$location.path(url);		// change the url to the user specific url, and let ngRouter handle it from there
	};

	$scope.getData = function getData(){

		$http.jsonp(BASE_API + "/search/users?q=" + $scope.q + "&callback=JSON_CALLBACK")
			.then(function(json) {
				// need to do some validation here in case this API fails
				$scope.users = json.data.data.items;
			});
	};

});