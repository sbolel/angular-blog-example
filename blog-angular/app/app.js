var myApp = angular.module('myApp', [
  'ui.router',
  'firebase',
  'ngMaterial',
  'angularMoment',
  'cmsClient',
  'mdLayout',
  'server',
  'myApp.home',
  'myApp.form',
]);

myApp.constant('ENV', 'dev').constant('FBURL', 'https://launch-annapolis.firebaseio.com/');

myApp.config(['$urlRouterProvider', '$logProvider', 'cmsClientProvider', 'FBURL', function ($urlRouterProvider, $logProvider, cmsClientProvider, FBURL) {
  'use strict';
  $logProvider.debugEnabled(true);
  $urlRouterProvider.otherwise('/');
  cmsClientProvider.setContentUrl(FBURL+'/content');
}]);

myApp.run(['$log', '$rootScope', '$state', '$stateParams',  'ServerService', '$cmsClient', function ($log, $rootScope, $state, $stateParams, ServerService, $cmsClient) {
  'use strict';
  // ServerService.ping();
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState){ 
    $rootScope.$state.$back = fromState;
  });
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $log.error('$stateChangeError: ', error, $rootScope.$state);
    if (error === 'AUTH_REQUIRED') {
      $state.go('user.login');
    }
  });
  $cmsClient.getContent().then(function(data){
    $rootScope.$content = data;
    $log.debug($rootScope.$content);
  }).catch(function(error){
    $log.error(error);
  });
}]);



myApp.filter('reverse',function() {
  'use strict';
  return function(items) {
    return _.toArray(items).slice().reverse();
  };
});
