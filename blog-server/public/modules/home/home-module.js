var homeModule = angular.module('home',[])

homeModule.config(['$stateProvider', function ($stateProvider) {
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
          templateUrl: 'modules/home/home.html'
        }
      }
    });
}]);

homeModule.controller('HomeController',['$log', '$scope', '$mdToast', 'FBURL', 'APPURL', function ($log, $scope, $mdToast, FBURL, APPURL){
  
}]);

