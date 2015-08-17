#!/usr/bin/env node
'use strict';

var debug = require('debug')('app'),
    express = require('express'),
    request = require('request'),
    _api = require('./routes'),
    _packageInfo = require('./../package.json');


// Express
var app = express();
app.use('/', _api);

app._packageInfo = _packageInfo;

// Module exports
module.exports = app;
