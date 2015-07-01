var WaitMan = require('../lib/wait-man');

describe('WaitMan.Waiter instance', function(){
  beforeAll(function(){
    waitMan = new WaitMan();
    waiter = new waitMan.Waiter();
    async_complete = false;
    dummy_async = setTimeout(function(){async_complete = true}, 500);
  });

  it('hates not being fed a success callback function', function(){
    var error = false;
    try{
      waiter.begin();
    }catch(err){
      error = true;
    }

    expect(error).toBeTruthy();
  });

  it('hates not being fed a test function', function(){
    var error = false;
    try{
      waiter.test();
    }catch(err){
      error = true;
    }

    expect(error).toBeTruthy();
  });

  it('waits for test function to return true', function(done){
    waiter.test = function(){ return async_complete; };

    var beganAt = +new Date();
    waiter.begin(function(uid){
      var elapsed = +new Date() - beganAt;
      expect(elapsed == 499 || elapsed == 500 || elapsed == 501).toBeTruthy();
      expect(uid).toEqual(waiter.uid);
      done();
    });
  });

  it('has an interval property which determines tick time', function(done){
    waiter.test = function(){ return async_complete; };
    waiter.interval = 1000;

    var beganAt = +new Date();
    waiter.begin(function(uid){
      var elapsed = +new Date() - beganAt;
      expect(elapsed == 999 || elapsed == 1000 || elapsed == 1001).toBeTruthy();
      expect(uid).toEqual(waiter.uid);
      done();
    });
  });

  it('can be aborted', function(done){
    waiter.test = function(){ return async_complete; };
    waiter.interval = 10;

    waiter.begin(function(uid){
      // The following should not be run
      // thus it is meant to fail.
      expect(false).toBeTruthy();
      done();
    });

    waiter.abort();
    setTimeout(function(){
      expect(waiter.aborted).toBeTruthy();
      done();
    }, 100);
  });
  
  it('can timeout', function(done){
    waiter.test = function(){ return false; };
    waiter.interval = 10;
    waiter.timeout = 50;

    waiter.begin(function(uid){
      // The following should not be run
      // thus it is meant to fail.
      expect(false).toBeTruthy();
      done();
    });

    setTimeout(function(){
      expect(waiter.aborted).toBeTruthy();
      expect(waiter.elapsed() >= 50 && waiter.elapsed() <= 61).toBeTruthy();
      done();
    }, 100);
  });
});