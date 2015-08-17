myApp.formModule.controller('FormController', ['$log', '$scope', '$mdToast', 'FBURL', function ($log, $scope, $mdToast, FBURL) {
  'use strict';
  var messagesList = new Firebase(FBURL+'/messages'),
      toastPosition = {bottom: true, top: false, left: false, right: true};

  var formCallbacks = {
    success: function() {
      $scope.messageData = {};
      $scope.contact.$setUntouched();
      $scope.contact.$setPristine();
      $mdToast.show($mdToast.simple().content('Sent!').position(getToastPosition()).hideDelay(5000));
    },
    error: function(error) {
      $mdToast.show($mdToast.simple().content('Error!').position(getToastPosition()).hideDelay(5000));
    }
  };

  var MessageRef = function() {
    return messagesList.push();
  };

  var Message = function(messageData, validity) {
    this.ref = new MessageRef();
    this.data = messageData;
    this.data.submitAt = Firebase.ServerValue.TIMESTAMP;
    this.data.submitAtString = Date(this.data.submitAt);
    this.valid = $scope.contact.$valid;
    return this;
  };

  Message.prototype.submit = function() {
    var that = this;
    if (this.valid) {
      this.ref.set(this.data, function(error) {
        that.onSubmit(error, formCallbacks.success, formCallbacks.error);
      });
    } else {
      that.onSubmit('form not valid', null, null);
    }
  };
  
  Message.prototype.onSubmit = function(error, successCb, errorCb) {
    if(error) {
      $log.error('Error submitting message:', error);
      if(errorCb && typeof(errorCb)==='function') {
        errorCb();
      }
    } else {
      $log.debug('Submitted message.');
      if(successCb && typeof(successCb)==='function') {
        successCb();
      }
    }
  };
  
  $scope.submit = function() {
    var msg = new Message(angular.copy($scope.messageData), $scope.contact.$valid && true);
    msg.submit();
  };
  
  function getToastPosition() {
    return Object.keys(toastPosition).filter(function(pos) {
      return toastPosition[pos];
    }).join(' ');
  }

}]);