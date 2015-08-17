#!/usr/bin/env node
'use strict';

var debug = require('debug')('api');
var cors = require('cors');
var express = require('express');
var path = require('path');
var router = express.Router();
var _firebase = require('./modules/firebase');


var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

router.use(cors());

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.use('/', express.static(path.join(__dirname, '../public')));
router.use('/fonts', express.static(path.join(__dirname, '../public/assets/fonts')));

router.post('/admin', jsonParser, function (req, res) {
  debug('POST /admin', req.body);
  if (!req.body) {
    res.status(400);
  } else {
    _firebase.updateModel(req.body).then(function(data){
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    }).catch(function (error) {
        res.status(error.status).send({
            status: error.status,
            error: error.message
        });
    });
  }
});

router.get('modules/home/home.html', function(req, res){res.render('public/modules/home/home.html');});
router.get('modules/user/templates/user-login.html', function(req, res){res.render('public/modules/user/templates/user-login.html');});
router.get('modules/user/templates/user-profile.html', function(req, res){res.render('public/modules/user/templates/user-profile.html');});
router.get('modules/admin/templates/admin-messages-index.html', function(req, res){res.render('public/modules/admin/templates/admin-messages-index.html');});
router.get('modules/user/templates/user.signup.html', function(req, res){res.render('modules/user/templates/user.signup.html');});

router.get('/ping', function(req, res){res.json({status: 200});});

module.exports = router;
