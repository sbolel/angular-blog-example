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
