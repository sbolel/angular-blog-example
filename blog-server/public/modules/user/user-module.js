var userModule = angular.module('user',[
  'user.services',
  'user.factories',
  ])

userModule.run(['UserService', function(UserService){
  UserService.init();
}]);

userModule.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('user', {
      url: '',
      abstract: true,
      controller: 'UserController',
      template: '<ui-view/>'
    })
    .state('user.profile', {
      url: '/profile',
      views: {
        '': {
          templateUrl: 'modules/user/templates/user.profile.html'
        }
      },
      resolve: {
        currentAuth: function(UserService) {
          return UserService.requireAuth();
        }
      }
    })
    .state('user.login', {
      url: '/login',
      views: {
        '': {
          templateUrl: 'modules/user/templates/user.login.html'
        }
      }
    })
    .state('user.logout', {
      url: '/logout',
      template: '<ui-view/>',
      controller: function($log, $state, UserService) {
        $log.debug("Logging out.");
        UserService.logout();
        $state.go('user.login',{alert: 'You have been logged out.'})
      }
    });
}]);

userModule.controller('UserController', ['$log', '$scope', '$state', 'UserService', function ($log, $scope, $state, UserService) {

  var postLoginPath = 'admin.index';

  var checkUserInputs = function() {
    return $scope.incomingUser.email && $scope.incomingUser.password;
  };

  var showAccountErrorAlert = function() {
    alert("Oops, we couldn't log you in.");
  };

  var showMissingInputAlert = function(){
    alert("Please enter your email and password to log in.");
  };

  $scope.incomingUser = {};

  $scope.loginWithPassword = function() {
    if(checkUserInputs()) {
      UserService.loginWithPassword($scope.incomingUser, function() {
        $state.go(postLoginPath);
      }, function(error){
        $log.error("Login error:",error);
        showAccountErrorAlert();
      });
    } else {
      showMissingInputAlert();
    }
  };

}]);


