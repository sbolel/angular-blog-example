(function(angular){
  'use strict';
  var serverUtil = angular.module('server', []);

  // serverUtil.constant('SERVER_URL', 'http://localhost:4000');
  serverUtil.constant('SERVER_URL', 'https://https://launch-annapolis.herokuapp.com');
  serverUtil.constant('PING_PARAMS', '?env=dev');

  serverUtil.service('ServerService', ['$log', '$q', '$http', 'SERVER_URL', 'PING_PARAMS', function ($log, $q, $http, SERVER_URL, PING_PARAMS){
    this.getServerUrl = function(){
      return SERVER_URL;
    };
    this.ping = function(params){
      var deferred = $q.defer();
      var completeUrlParamsString = PING_PARAMS;
      if(params){
        completeUrlParamsString += params;
      }
      $log.debug('Pinging server with params',completeUrlParamsString);
      $http.get(SERVER_URL+'/ping'+completeUrlParamsString)
        .success(function(data, status, headers, config) {
          $log.debug('Server ping success. \n - status:', status);
          deferred.resolve({data: data, status: status, headers: headers, config: config});
        }).error(function(data, status, headers, config){
          $log.error('Server ping failed. \n - status:', status, '\n - data:', data);
          deferred.reject({data: data, status: status, headers: headers, config: config});
        });
      return deferred.promise;
    };
    return this;
  }]);

})(window.angular);