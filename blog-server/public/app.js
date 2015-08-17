var adminApp = angular.module('adminApp', [
  'ngMaterial',
  'ui.router',
  'firebase',
  'angularMoment',
  'mdLayout',
  'user',
  'home',
  'admin',
  'cmsClient',
  'cmsAdmin',
]);

adminApp.constant('AUTO_ANON', false);
adminApp.constant('FBURL', 'https://launch-annapolis.firebaseio.com');
adminApp.constant('APPURL', 'https://launch-annapolis.firebaseapp.com/');

adminApp.config(['$urlRouterProvider', '$logProvider', '$mdThemingProvider', 'cmsClientProvider', 'FBURL', function ($urlRouterProvider, $logProvider, $mdThemingProvider, cmsClientProvider, FBURL) {
  $logProvider.debugEnabled(true);
  $urlRouterProvider.otherwise('/');
  cmsClientProvider.setContentUrl(FBURL+'/content');
  $mdThemingProvider.theme('default').backgroundPalette('grey').primaryPalette('deep-purple').accentPalette('pink');
}]);

adminApp.run(['$log', '$rootScope', '$state', '$stateParams', function ($log, $rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
      $rootScope.$state.$back = fromState;
    });
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      $log.error('$stateChangeError:', error);
      if (error === "AUTH_REQUIRED") {
        $state.go("user.login");
      } else {
        $state.go($rootScope.$state.$back);
      }
    });
}]);
