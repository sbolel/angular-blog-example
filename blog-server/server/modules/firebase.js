#!/usr/bin/env node
'use strict';

var Firebase = require('firebase'),
    FirebaseTokenGenerator = require('firebase-token-generator'),
    Q = require('q'),
    Events = require('events'),
    emitter = new Events.EventEmitter(),
    debug = require('debug')('firebase-admin'),
    _FIREBASE_URL = process.env.LAUNCH_FIREBASE_URL,
    _FIREBASE_TOKEN = process.env.LAUNCH_FB_SECRET,
    _FIREBASE_REF = new Firebase(_FIREBASE_URL);

var setup = {
  admin: function() {
    return authenticateTrustedServer();
  }
};

function checkAdmin(authData){
  var deferred = Q.defer();
  debug('authData',authData);
  _FIREBASE_REF.child('config/adminUsers').orderByKey().equalTo(authData.uid).once('value', function(snapshot){

    if(snapshot.exists() && snapshot.hasChild(authData.uid)){
      deferred.resolve(true);
    } else {
      deferred.reject('NOT_ADMIN');
    }
  }, function (error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

function updateModel(body){
  debug("ADMIN OBJECT UPDATE REQUEST", body);
  var deferred = Q.defer();
  var onComplete = function(error){
    if(error){
        debug(error);
        deferred.reject(error);
    } else {
      debug("Completed Request");
      deferred.resolve(JSON.stringify(body));
    }
  }
  if(body.auth){
    authWithToken(body.auth.token).then(function(authData){
      // Switch back to trusted authentication
      authenticateTrustedServer().then(function(){
      // TODO check to make sure the user is actually an admin
      checkAdmin(authData)
        .then(function(){
          var ref = new Ref(body.path);
          // Then do actions
          if(body.action==='push') {
            var that = ref.push({}, function(error){
              body.params.key = that.key();
              body.params.parent = that.parent().key();
              ref.child(that.key()).update(body.params, function(error){
                onComplete(error);
              });
            });
          } else if(body.action==='set') {
            var that = ref.set(body.params, onComplete);
          } else if(body.action==='update'){
            var ref = new Ref(body.path);
            var that = ref.update(body.params, onComplete);
          } else if(body.action==='remove'){
            var that = ref.remove(onComplete);
          } else {
            onComplete({status: 400, message: 'Malformed Data, missing action parameter'});
          }
        }).catch(function(){
          onComplete({status: 401, message: 'Error: Insufficient privilege'});
        });
      }).catch(function(){
        onComplete({status: 500, message: 'Internal Server Error'});
      });
    }).catch(function(){
      onComplete({status: 401, message: 'Error: Authentication failed'});
    });
  } else {
    onComplete({status: 401, message: 'Error: Authentication not provided'});
  }
  return deferred.promise;
}

module.exports = {
  firebase: {
    url: _FIREBASE_URL,
    ref: _FIREBASE_REF,
    auth: initialize()
  },
  updateModel: updateModel
};

function authenticateTrustedServer(){
  var deferred = Q.defer();
  authWithToken(_FIREBASE_TOKEN)
    .then(function(result){
      debug("ADMIN Auth "+_FIREBASE_URL+" successful.");
      deferred.resolve(result);
    }).catch(function(error){
      debug("ADMIN Auth "+_FIREBASE_URL+" error:", error);
      deferred.reject(error);
    });
  return deferred.promise;
}

function authWithToken(token){
  var deferred = Q.defer();
  _FIREBASE_REF.authWithCustomToken(token, function(error, authData) {
    if (error) {
      debug("Auth "+_FIREBASE_URL+" error:", error);
      deferred.reject(error);
    } else {
      debug("Auth "+_FIREBASE_URL+" successful.");
      deferred.resolve(authData);
    }
  });
  return deferred.promise;
}

function initialize() {
  debug("STARTING FIREBASE");
  var promises = [];
  promises.push(setup.admin());
  Q.all(promises).then(function(){
    debug("FIREBASE READY");
    emitter.emit('firebaseReady');
  });
}


  function Ref(path){
    var ref = new Firebase(_FIREBASE_URL);
    return ref.child(path);
  }
