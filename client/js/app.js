var app = angular.module('app', ['ui.router', 'ngFx'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/home");
		$stateProvider
		  .state('home', {
		    url: "/home",
		    templateUrl: "/../home.html"
		  })
		  .state('login', {
		    url: "/login",
		    templateUrl: "/../templates/login.html"
		  })
		  .state('signup', {
		    url: "/signup",
		    templateUrl: "/../templates/signup.html"
		  })
	})
	.controller('mainCtrl', function($scope, $location){
		// testing

		// $scope.a = 5;
		// $scope.b = 2;
	});