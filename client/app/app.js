'use strict';
angular.module('vagabond', ['ngAnimate', 'ngFx', 'ui.router', 'ui.bootstrap', 'ui.calendar'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('maps', {
        url: '/maps',
        abstract: true,
        templateUrl: 'app/activemap/template.html' //this HTML file will hold the bare bones needed to load the active map views when data is received
      })
      .state('maps.guid', {
        url: '/:guid',
        templateUrl: 'app/activemap/activemap.html', // will hold article and sections and map
        controller: 'ActiveMapControler'
      });

    $urlRouterProvider.otherwise('/');
  });