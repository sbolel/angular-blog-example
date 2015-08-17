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
    '$log', '$cmsClient', '$scope', '$state', '$q', '$mdDialog', 'UserService', 
    function($log, $cmsClient, $scope, $state, $q, $mdDialog, UserService) {

  $scope.$content = {};
  $scope.$content.focusedData = {};

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

