myApp.homeModule = angular.module('myApp.home',[]);

myApp.homeModule.config(['$stateProvider', function ($stateProvider) {
  'use strict';
  $stateProvider
    .state('home', {
      url: '/',
      abstract: true,
      template: '<ui-view/>'
    })
    .state('home.index', {
      url: '',
      views: {
        '': {
          controller: 'HomeController',
          templateUrl: 'src/home/home-template.html'
        }
      }
    });
}]);

myApp.homeModule.controller('HomeController',['$log', '$scope', '$mdToast', 'FBURL', function ($log, $scope, $mdToast, FBURL){
  'use strict';
}]);