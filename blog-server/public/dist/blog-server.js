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

angular.module('admin.directives', [])

.directive('cmsList', [function(){
  return {
    // controller: 'cmsController',
    scope: {
      data: '=',
      edit: '='
    },
    templateUrl: 'modules/admin/templates/content-list-template.html'
  };
}])


.directive('cmsItem', [function(){

  var Schema = function(item) {
    if(item.parent === 'events'){
      return {
        dateString: item.dateString,
        timestamp: item.timestamp,
        title: item.title,
        content: content,
        parent: 'blogEntries',
        key: item.key
      };
    } else {

    }
  };

  return {
    // controller: 'cmsController',
    scope: {
      item: '=',
      edit: '='
    },
    controller: function ($scope) {
      $scope.editItem = function (evt) {
        //Call external scope's function
        $scope.edit(evt, $scope.item);
      };
    },
    transclude: true,
    templateUrl: 'modules/admin/templates/content-item-template.html',
    link: function(scope, element, attrs, controllers) {
      var item = new Schema(scope.item);
      scope.keys = item;
    }
  };
}]);


var adminModule = angular.module('admin',['admin.directives']);

adminModule.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('admin', {
      url: '/admin',
      abstract: true,
      controller: 'AdminController',
      templateUrl: 'modules/admin/templates/admin-layout.html',
      resolve: {
        currentAuth: function(UserService) {
          return UserService.requireAuth();
        }
      }
    })
    .state('admin.index', {
      url: '',
      views: {
        'admin-content': {
          templateUrl: 'modules/admin/templates/admin-dashboard-index.html',
        }
      },
      data: {
        title: 'Dashboard'
      }
    })
    .state('admin.content', {
      url: '/content',
      views: {
        'admin-content': {
          templateUrl: 'modules/admin/templates/admin-content-index.html'
        }
      },
      data: {
        title: 'Content Management'
      }
    });
}]);

adminModule.controller('AdminController', [
    '$log', '$cmsClient', '$scope', '$state', '$q', '$mdDialog', 'UserService', '$firebaseObject',
    function($log, $cmsClient, $scope, $state, $q, $mdDialog, UserService, $firebaseObject) {

  $scope.$content = {};
  $scope.$content.focusedData = {};

  var contentRef = new Firebase("https://launch-annapolis.firebaseio.com/content");
  var syncObject = $firebaseObject(contentRef);

  syncObject.$bindTo($scope, "content");

  var auth = UserService.getCurrentAuth();
  
  $scope.init = function() {
    $scope.$content = $cmsClient.getContent().then(function(data){
      $scope.$content = data;
    });
  };

  var DataObject = function(type){
    var obj = {};
    if(type === 'blogEntries'){
      obj = {
        dateString: '',
        timestamp: '',
        title: '',
        content: '',
        parent: 'blogEntries',
        key: ''
      };
    } else {

    }
    obj.parent = type;

    return obj;
  };
  var showDialog = function(ev, templateUrl, action, path) {
    $mdDialog.show({
      controller: RequestController,
      templateUrl: templateUrl,
      clickOutsideToClose: true,
      escapeToClose: true,
      targetEvent: ev,
      locals : {
        data: {
          action: action, 
          path: path,
          auth: auth
        },
        parentScope: $scope
      }
    })
    .then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };

  $scope.create = function(ev, objectType){
    $log.log('create');
    $scope.$content.focusedData = new DataObject(objectType);
    showDialog(ev, 'modules/admin/templates/dialog-new-event.html', 'push', '/content/'+objectType);
  };

  $scope.edit = function(ev, item){
    // TODO set focused data here
    $scope.$content.focusedData = $scope.$content[item.parent][item.key];
    showDialog(ev, 'modules/admin/templates/dialog-new-event.html', 'update', '/content/'+item.parent);
  };

}]);

function RequestController($log, $scope, $q, $cmsAdmin, $mdDialog, data, parentScope) {

  var actionData = data;
  $scope.newObject = {};
  if(parentScope.$content.focusedData){
    $scope.newObject = parentScope.$content.focusedData;
  }

  var errorCb = function(error){
    if(error){
      $log.error(JSON.stringify(error));
    }
  };

  var Request = function(){
    var deferred = $q.defer();
    var config = {};
    config.auth = actionData.auth;
    config.action = arguments[0];
    config.path = arguments[1];
    config.params = arguments[2];
    $cmsAdmin(config).then(function(result){
      $log.debug("Completed Request.");
      deferred.resolve(result)
    }).catch(function(error){
      $log.error(JSON.stringify(error));
      deferred.reject(error);
    });
    return deferred.promise;
  };

  var onComplete = function(answer){
    $scope.eventForm = {};
    $scope.newObject = {};
    $mdDialog.hide(answer);
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $scope.eventForm = {};
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    if(actionData.action === 'push'){
      createObject().then(onComplete).catch(showErrorDialog);
    } else if(actionData.action === 'update'){
      updateObject().then(onComplete).catch(showErrorDialog);
    } else if(actionData.action === 'remove'){
      removeObject().then(onComplete).catch(showErrorDialog);
    } else {
      $mdDialog.hide(answer);
    }
  };

  function showErrorDialog(error){
        $mdDialog.show(
          $mdDialog.alert()
            .title('Error')
            .content('Sorry, something went wrong.\n\n'+JSON.stringify(error))
            .ariaLabel('Error Alert')
            .ok('Back')
        );
  }

  function createObject(){
    var deferred = $q.defer();
    var req = new Request('push', actionData.path, $scope.newObject);
    req.then(function(result){
      deferred.resolve(result);
    }).catch(function(error){
      deferred.reject(error);
    })
    return deferred.promise;
  }

  function updateObject(){
    var deferred = $q.defer();
    var req = new Request('update', actionData.path+'/'+parentScope.$content.focusedData.key, $scope.newObject);
    req.then(function(result){
      deferred.resolve(result);
    }).catch(function(error){
      deferred.reject(error);
    })
    return deferred.promise;
  }

  function removeObject(path){
    var deferred = $q.defer();
    var req = new Request('remove', actionData.path);
    req.then(function(result){
      deferred.resolve(result);
    }).catch(function(error){
      deferred.reject(error);
    })
    return deferred.promise;
  }

};


adminApp.factory('Content', ['$rootScope', '$log', 'ContentFactory', 'FBURL', function($rootScope, $log, $firebaseAuth, ContentFactory, FBURL){
  var userData;

  return function(){
      var contentRef = new Firebase('https://launch-annapolis.firebaseio.com/content');
      var syncData = new ContentFactory(contentRef);
      syncData.$bindTo($rootScope, "content").then(function() {
        $log.debug("Bound $rootScope.content!");
      });
      return syncData;
    };

}]);

adminApp.factory('ContentFactory', ['$rootScope', '$firebaseObject', '$q', 'FBURL', function($rootScope, $firebaseObject, $q, FBURL){
  var ref = new Firebase(FBURL);
  return $firebaseObject.$extend({
    $$defaults: {

    },
    $updateContent: function() {

    }
  });
}]);

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


var userFactory = angular.module('user.factories',[])

userFactory.factory('User',['$q', '$rootScope', 'UserFactory', 'FBURL', function ($q, $rootScope, UserFactory, FBURL){

  var userData;
  var deferred = $q.defer();
  
  return function(userAuth){
    if(userAuth.uid){
      var userRef = new Firebase(FBURL+'/users/'+userAuth.provider+'/'+userAuth.uid);
      userData = new UserFactory(userRef);
      userData.$updateUser(); // TODO: this causes an error if token is expired
      userData.$bindTo($rootScope, 'userData').then(function(){
        $rootScope.auth = userData.$auth.$getAuth();
        deferred.resolve(userData);
      }).catch(function(error){
        deferred.reject('Error binding $rootScope.userData', error);
      });
    } else {
      deferred.reject('User(userAuth): userAuth not inputted.');
    }
    return deferred.promise;
  };
}]);

userFactory.factory('UserFactory', ['$rootScope', '$firebaseAuth', '$firebaseObject', '$q', 'FBURL', function ($rootScope, $firebaseAuth, $firebaseObject, $q, FBURL){

  var ref = new Firebase(FBURL);

  return $firebaseObject.$extend({
    $$defaults: {
      $auth: $firebaseAuth(ref),
    },
    $updateUser: function() {
      var deferred = $q.defer();
      var authDetails = {};
      angular.copy(this.$auth.$getAuth(), authDetails);
      delete authDetails.auth;
      this.auth = authDetails;
      if (authDetails.password) {
        this.auth.email = authDetails.password.email;
      }
      this.$ref().update(this.auth, function(error){
        if(error){
          deferred.reject(error);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    $logout: function() {
      this.$destroy();
      this.$auth.$unauth();
    }
  });

}]);
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



var userService = angular.module('user.services',['user.factories'])

.service('UserService',['$log', '$q', '$firebaseAuth', 'FBURL', 'User', 'AUTO_ANON', function($log, $q, $firebaseAuth, FBURL, User, AUTO_ANON) {  
var self, auth, _currentUser, previousUser;
  var _firebaseRef = new Firebase(FBURL);
  var _authObj = $firebaseAuth(_firebaseRef);

  self = {
    init: function() {
      
      var authenticateAnonymousUser = function(){
        $log.debug("Authenticating anonymous user...");
        self.loginAnonymously().then(function(authData){
          User(authData).then(function(userData){
            _currentUser = userData;
            $log.debug("Anonymous user loaded", _currentUser);
          }).catch(function(error){
            $log.error("Error loading new anonymous user", error);
          });
        }).catch(function(error){
          $log.error("Error authenticating anonymous user", error);
        });
      };

      var loadExistingUser = function(){
        User(self.getCurrentAuth()).then(function(userData){
          _currentUser = userData;
          $log.debug("Existing user loaded", _currentUser);
        }).catch(function(error){
          $log.debug("Error loading existing user", error);
          // TODO: Handle expired token.
        });
      };

      $log.debug("Checking for existing user...");
      if (self.getCurrentAuth()) {
        loadExistingUser();
      } else {
        if(AUTO_ANON == true) {
          authenticateAnonymousUser();
        }
      }

    },
    getCurrentAuth: function(){
      if(_authObj) {
        return _authObj.$getAuth();
      } else {
        return null;
      }
    },
    requireAuth: function () {
      return _authObj.$requireAuth();
    },
    getRef: function() {
      return _currentUser.$ref();
    },
    createUser: function(user, successCb, errorCb){
      self.logout();
      _authObj.$createUser({
        email: user.email,
        password: user.password
      }).then(function(userData) {
        $log.debug("Created user:" + userData.uid);
        // [TODO] Use loginWithPassword here.
        return _authObj.$authWithPassword({
          email: user.email,
          password: user.password
        });
      }).then(function(authData) {
        self.init();
        if(successCb) successCb();
      }).catch(function(error) {
        $log.error("Error: ", error);
      });
    },
    loginWithPassword: function(user, successCb, errorCb) {
      self.logout();
      _authObj.$authWithPassword({
        email: user.email,
        password: user.password
      }).then(function(authData) {
        $log.debug("User", authData.uid, "logged in.");
        // [TODO] Use onAuth listener to avoid having to call init();
        self.init();
        if(successCb) successCb();
      }).catch(function(error) {
        $log.error("User login failed:", error);
        if(errorCb) errorCb(error);
      });
    },
    loginAnonymously: function() {
      var deferred = $q.defer();
      _authObj.$authAnonymously().then(function(authData) {
        deferred.resolve(authData);
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },
    logout: function(successCb, errorCb) {
      if (_authObj.$getAuth()) {
        _currentUser.$logout();
        $log.debug("User successfully logged out.");
        if(successCb) successCb();
      } else {
        $log.debug("User tried to logout but is not logged in.");
        if(errorCb) errorCb();
      }
    }
  };
  return self;
}]);