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
  
  it('has WaiterCollection constructor',function(){
    expect(typeof waitMan.WaiterCollection).toBe('function');
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

describe('WaitMan.WaiterCollection instance', function(){
  beforeAll(function(){
    waitMan = new WaitMan();
    waiterCollection = new waitMan.WaiterCollection();
    waiter_a = new waitMan.Waiter();
    waiter_b = new waitMan.Waiter();
  });
  
  it('can hold multiple Waiter instances', function(){
    var waiters_type = Object.prototype.toString.call(waiterCollection.waiters);
    expect(waiters_type).toBe('[object Array]');
    expect(waiterCollection.waiters.length).toBe(0);
  
    waiterCollection.waiters.push(waiter_a);
    waiterCollection.waiters.push(waiter_b);
    
    expect(waiterCollection.waiters.length).toBe(2);
    expect(waiterCollection.waiters).toEqual([waiter_a, waiter_b]);
  });
  
  describe('with many Waiter instances', function(){
    beforeEach(function(){
      waitMan = new WaitMan();
      waiterCollection = new waitMan.WaiterCollection();
      waiter_a = new waitMan.Waiter();
      waiter_b = new waitMan.Waiter();
      
      waiterCollection.waiters.push(waiter_a);
      waiterCollection.waiters.push(waiter_b);
    
      async_complete_a = false;
      async_complete_b = false;
      dummy_async_a = setTimeout(function(){async_complete_a = true}, 250);
      dummy_async_b = setTimeout(function(){async_complete_b = true}, 500);
    });
    
    it('can initiate contained Waiter instances', function(done){
      waiterCollection.waiters[0].test = function(){ return async_complete_a; };
      waiterCollection.waiters[1].test = function(){ return async_complete_b; };
      
      waiterCollection.onDone = function(){
        expect(waiter_a.successful).toBeTruthy();
        expect(waiter_b.successful).toBeTruthy();
        expect(waiter_a.aborted).toBeFalsy();
        expect(waiter_b.aborted).toBeFalsy();
        done();
      };
      
      waiterCollection.begin();
      expect(waiterCollection.pending_waiters.length).toBe(2);
    });
    
    it('can abort its initiated Waiter instances', function(done){
      waiterCollection.waiters[0].test = function(){ return async_complete_a; };
      waiterCollection.waiters[1].test = function(){ return async_complete_b; };
      
      waiterCollection.onDone = function(){
        expect(waiter_a.aborted).toBeTruthy();
        expect(waiter_b.aborted).toBeTruthy();
        expect(waiter_a.successful).toBeFalsy();
        expect(waiter_b.successful).toBeFalsy();
        done();
      };
      
      waiterCollection.begin();
      expect(waiterCollection.pending_waiters.length).toBe(2);
      waiterCollection.abort();
    });
    
    it('can track state of its Waiter instances', function(done){
      waiterCollection.waiters[0].test = function(){
        return async_complete_a;
      };
      waiterCollection.waiters[1].test = function(){ return async_complete_b; };
      
      waiterCollection.onDone = function(){
        expect(waiter_a.successful).toBeTruthy();
        expect(waiter_a.aborted).toBeFalsy();
        expect(waiter_a.pending).toBeFalsy();
        expect(waiter_b.successful).toBeFalsy();
        expect(waiter_b.aborted).toBeTruthy();
        expect(waiter_b.pending).toBeFalsy();
        expect(waiterCollection.pending_waiters.length).toBe(0);
        expect(waiterCollection.successful_waiters.length).toBe(1);
        expect(waiterCollection.aborted_waiters.length).toBe(1);
        done();
      };
      
      waiterCollection.begin();
      
      setTimeout(function(){
        waiterCollection.abort();
      }, 375);
      
      expect(waiterCollection.pending_waiters.length).toBe(2);
      expect(waiterCollection.successful_waiters.length).toBe(0);
      expect(waiterCollection.aborted_waiters.length).toBe(0);
    });
  });
});