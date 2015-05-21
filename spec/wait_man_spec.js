var WaitMan = require('../lib/wait-man');

describe('WaitMan module', function(){
  beforeAll(function(){
    waitMan = new WaitMan();
  });
  
  it('is a constructor',function(){
    expect(typeof WaitMan).toBe('function');
  });
  
  it('can be instantiated',function(){
    expect(typeof waitMan).toBe('object');
  });
  
  it('can extend objects', function(){
    var obj_a = {"first_key": "value", "second_key": "value 2"};
    var obj_b = {"first_key": "value 1", "third_key": "value 3"};
    
    waitMan.extend(obj_a, obj_b);
    
    expect(obj_a).toEqual({"first_key": "value 1", "second_key": "value 2", "third_key": "value 3"});
  });
  
  it('has Waiter constructor',function(){
    expect(typeof waitMan.Waiter).toBe('function');
  });
});

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
      expect(elapsed).toBeGreaterThan(500);
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
      expect(elapsed).toBeGreaterThan(1000);
      expect(uid).toEqual(waiter.uid);
      done();
    });
  });
});