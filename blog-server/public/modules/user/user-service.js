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