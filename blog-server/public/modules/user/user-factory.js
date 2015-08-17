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