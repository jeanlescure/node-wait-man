var WaitMan = require('../lib/wait-man');

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
      dummy_async_a = setTimeout(function(){async_complete_a = true;}, 250);
      dummy_async_b = setTimeout(function(){async_complete_b = true;}, 500);
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
    
    it('can timeout',function(done){
      waiterCollection.waiters[0].interval = 25;
      waiterCollection.waiters[0].test = function(){ return async_complete_a; };
      waiterCollection.waiters[1].interval = 25;
      waiterCollection.waiters[1].test = function(){ return false; };
      waiterCollection.interval = 50;
      waiterCollection.timeout = 300;

      waiterCollection.onDone = function(){
        expect(waiterCollection.waiters[0].successful).toBeTruthy();
        expect(waiterCollection.waiters[1].aborted).toBeTruthy();
        expect(waiterCollection.elapsed() >= 300 && waiterCollection.elapsed() <= 351).toBeTruthy();
        done();
      };

      waiterCollection.begin();
    });
  });
});