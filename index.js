'use strict';

var util = require('util');
var assert = require('assert');
var request = require('superagent');
var qs = require('querystring');
var co = require('co');
var debug = require('debug')('soundcloudy');
var range = require('range-generator');
var through = require('through');
var array = require('toarray-iterator');
var arr = require('array-iterator');
var $ = require('modular-chainer');
var read = require('co-read');
var format = util.format;

module.exports = function(clientId) {
  return SoundCloudy.bind(null, clientId);
}

function SoundCloudy(opts) {
  if (!(this instanceof SoundCloudy))
    return new SoundCloudy(opts);
  var clientId = opts.clientId || opts;
  this.param('client_id', clientId);
  this.api = opts.api || 'https://api.soundcloud.com';
}


/**
 * Build the querystring
 *
 * @api public
 */
SoundCloudy.prototype.qs = function(extra) {
  var d = {};
  for (var k in this.params)
    d[k] = this.params[k]
  for (var k in extra)
    d[k] = extra[k]
  return qs.stringify(d);
}


SoundCloudy.prototype.concurrency = function(c) {
  if (c == null) return this._concurrency;
  this._concurrency = c
  return this
}

/**
 * limit param helper
 *
 * @api public
 */
SoundCloudy.prototype.pageSize =
SoundCloudy.prototype.limit = function(limit) {
  return this.param("limit", limit)
}

/**
 * Set querystring parameters
 *
 * @api public
 */
SoundCloudy.prototype.param = function(k, v) {
  this.params = this.params || {};
  if (k != null && v == null) return this.params[k];
  this.params[k] = v;
  return this;
}

/**
 * offset param helper
 *
 * @api public
 */
SoundCloudy.prototype.offset = function(offset) {
  return this.param("offset", offset)
}

/**
 * Sets the request endpoint
 *
 * @api public
 */
SoundCloudy.prototype.resource = function(resource) {
  // format helper for resource
  var args = [].slice.call(arguments, 1);
  args.unshift(resource)
  resource = format.apply(null, args);

  var url = format('%s/%s.json', this.api, resource)
  this.url = url;
  return this;
}

/**
 * Checks to see if we need to make any more
 * requests for more pages
 *
 * @api private
 */
function donePaging(items, pageSize) {
  if (!items || !Array.isArray(items)) return true;
  return items.some(function(item){
    return item.length < pageSize;
  });
}

/**
 * batch request iterator
 *
 * @api private
 */
SoundCloudy.prototype.batch = function(offset, pageSize, n) {
  n = n == null? 2 : n;
  var self = this;

  function* next() {
    for (let i of range(n)) {
      yield self.run({ offset: offset })
      offset += pageSize;
    }
  }

  return function*(){ return yield array(next()); }
}


SoundCloudy.prototype.all = function*(c) {
  var items = [];
  var stream = this.allStream(c);
  var item;
  while (item = yield read(stream))
    items.push(item);
  return items;
}

/**
 * Streaming version of all
 *
 * @api public
 */

SoundCloudy.prototype.allStream = function() {
  var stream = through();
  stream.pause();
  co(this._allStream(stream))();
  return stream;
}

/**
 * internal all stream
 *
 * @api public
 */
SoundCloudy.prototype._allStream = function*(stream) {
  var concurrency = this.concurrency() == null? 3 : this.concurrency();

  var self = this;
  var results = [];
  self.limit(self.limit() == null? 50 : self.limit())
  var pageSize = self.limit();
  var offset = self.offset() || 0;

  var next = this.batch(offset, pageSize, concurrency)
  var first = true;
  var batch;

  while(first || !donePaging(batch, pageSize)) {
    first = false;
    stream.pause();
    batch = yield next();
    stream.resume();
    for (let responses of arr(batch)) {
      for (let response of arr(responses)) {
        stream.push(response)
      }
    }
  }

  stream.push(null);
  return stream;
}

/**
 * Run a single request
 *
 * @api public
 */
SoundCloudy.prototype.run = function(params) {
  var self = this;
  return function(cb) {
    var url = self.url + "?" + self.qs(params || self.params)
    debug('resource url %s', url);
    request
    .get(url)
    .set('Accept', 'application/json')
    .end(function(err, res){
      var obj;
      try {
        obj = JSON.parse(res.text);
      } catch (e) {
        return done(e, res);
      }
      err = obj.errors? new Error(format("%j",obj.errors)) : err;
      return cb(err, obj);
    });
  }
}

