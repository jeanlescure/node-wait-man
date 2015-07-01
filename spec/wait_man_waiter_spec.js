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
      waiter.tick();
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

    var async_uid = '';
    var beganAt = +new Date();
    waiter.tick(function(uid){
      var elapsed = +new Date() - beganAt;
      expect(elapsed == 499 || elapsed == 500 || elapsed == 501).toBeTruthy();
      expect(uid).toEqual(waiter.uid);
      done();
    });
  });

  it('has an interval property which determines tick time', function(done){
    waiter.test = function(){ return async_complete; };
    waiter.interval = 1000;

    var async_uid = '';
    var beganAt = +new Date();
    waiter.tick(function(uid){
      var elapsed = +new Date() - beganAt;
      expect(elapsed == 999 || elapsed == 1000 || elapsed == 1001).toBeTruthy();
      expect(uid).toEqual(waiter.uid);
      done();
    });
  });

  it('can be aborted', function(done){
    waiter.test = function(){ return async_complete; };
    waiter.interval = 10;
    waiter.aborted = true;

    var async_uid = '';
    var beganAt = +new Date();
    waiter.tick(function(uid){
      // The following should not be run
      // thus it is meant to fail.
      expect(waiter.aborted).toBeTruthy();
      done();
    });

    setTimeout(function(){
      expect(waiter.aborted).toBeTruthy();
      done();
    }, 100);
  });
});