
var expect = require('expect.js');
var soundcloud = require('./');
var assert = require('assert');
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
        .all(6)

      expect(tracks).to.be.a(Array);
      assert(tracks.length > 50);
    })(done);
  });
});

describe('all pages', function(){
});
