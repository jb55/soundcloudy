
# soundcloudy

  A simple soundcloud api wrapper

  [![Build Status](https://travis-ci.org/jb55/soundcloudy.svg)](https://travis-ci.org/jb55/soundcloudy)

## Installation

  Install with npm

    $ npm install soundcloudy

## Example

```js
var co = require('co');
var soundcloud = require('soundcloudy');
var request = soundcloud(clientId);

// user
var user = 'monstercat'

co(function* () {
  // single page
  var tracks = yield request()
    .resource('users/%s/tracks', user)
    .run()

  // all pages with fast pagination
  var tracks = yield request()
    .resource('users/%s/tracks', user);
    .pageSize(500)
    .concurrency(2)
    .all()
})();

```

## Stream Example

```js
var through = require('through');
var request = require('soundcloudy')(clientId);

request()
.resource('users/%s/tracks', 'monstercat');
.pageSize(300)
.concurrency(2)
.allStream()
.pipe(through(function(track){
  console.log(track);
}));

```

## API

### soundcloudy(clientId)

returns: Request

### Request.resource(route[, route convenience formatters, ...])

returns: Request

Set the location for the request

### Request.param(key, value)

returns: Request

Querystring parameter

### Request.run()

returns: `co` yieldable

Run a single request

### Request.concurrency(n)

returns: Request

Set the batch request level for `all` and `allStream` requests

### Request.all()

returns: `co` yieldable

Keep running requests until all pages are fetched. Use `.concurrency` to
adjust request batching. `all` does requests optimistically until all pages are
retrieved.

### Request.allStream()

returns: Readable stream

Stream paged results

## License

  The MIT License (MIT)

  Copyright (c) 2014 William Casarin

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
