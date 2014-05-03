
var expect = require('expect.js');
var through = require('through');
var soundcloud = require('./');
var assert = require('assert');
var debug = require('debug')('soundcloudy:test');
var fmt = require('util').format;
var co = require('co');

var clientId = process.env.SOUNDCLOUDY_CLIENT_ID
if (!clientId) {
  console.log("type 'SOUNDCLOUDY_CLIENT_ID=your_client_id npm test' to run tests");
  process.exit(0);
}

var request = soundcloud(clientId)

describe('user tracks', function(){
  it('seems to work', function(done){
    co(function*(){
      var tracks = yield request()
        .resource('users/%s/tracks', 'monstercat')
        .limit(1)
        .offset(1)
        .run()

      expect(tracks).to.be.a(Array)
      expect(tracks.length).to.be(1);
    })(done);
  });

  it("gets all pages", function(done){
    co(function*(){
      var tracks = yield request()
        .resource('users/%s/tracks', 'monstercat')
        .limit(300)
        .concurrency(2)
        .all()

      expect(tracks).to.be.a(Array);
      assert(tracks.length >= 300);
    })(done);
  });

  it("stream works", function(done){
    var tracks = request()
      .resource('users/%s/tracks', 'jb55')
      .concurrency(1)
      .allStream()
      .pipe(through(function(item){
        debug('jb55 track %j', item);
        expect(item.kind).to.be('track');
      }))
      .on('end', done);
  });

});

describe('all pages', function(){
});
