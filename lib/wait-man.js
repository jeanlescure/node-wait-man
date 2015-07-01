(function(){
  function $$waitman$$WaitMan(options){
    function extend(target, extender_obj){
      for (k in extender_obj){
        target[k] = extender_obj[k];
      }
    }
    
    this.extend = extend; // For Spec's sake.
    
    function no_done(){ throw "No done callback found!"; };
    
    this.WaiterCollection = function(options){
      var self = this;
      
      this.defaults = {
        waiters: [],
        pending_waiters: [],
        successful_waiters: [],
        aborted_waiters: [],
        onDone: no_done,
        interval: 100,
        timeout: 0,
        beganAt: 0,
        endedAt: 0,
        aborted: false
      };
      
      this.options = options;
      
      extend(this, this.defaults);
      if (typeof this.options !== 'undefined') extend(this, this.options);
      
      function onSuccess(uid){
        var successful_waiter = self.pending_waiters.filter(function(w){
          return w.uid === uid;
        })[0];
        
        self.successful_waiters.push(successful_waiter);
        
        waiter_not_pending(uid);
      }
      
      function waiter_not_pending(uid){
        self.pending_waiters = self.pending_waiters.filter(function(w){
          return w.uid !== uid;
        });
      }
      
      this.elapsed = function(){
        var elapsed = (this.pending_waiters.length > 0) ? +new Date() - this.beganAt : this.endedAt - this.beganAt;
        return elapsed;
      };
      
      this.check_timeout = function(){
        return (this.elapsed() > this.timeout && this.timeout > 0);
      };
      
      function tick(){
        if (self.check_timeout()) self.abort();
        
        if (!self.aborted) self.timeoutfn = setTimeout(function(){
          if (self.check_timeout()) self.abort();
          
          if (self.pending_waiters.length === 0 && !self.aborted){
            self.onDone();
          }else{
            tick();
          }
        }, self.interval);
      }
      
      function resetWaiterLists(){
        self.pending_waiters = self.waiters.filter(function(){return true;});
        self.successful_waiters = [];
        self.aborted_waiters = [];
      }
      
      this.begin = function(){
        if (self.waiters.length < 1) throw "No waiters set!";
        
        self.beganAt = +new Date();
        self.endedAt = 0;
        
        resetWaiterLists();
        self.aborted = false;
        
        for (var i in self.pending_waiters){
          self.pending_waiters[i].begin(onSuccess);
        }
        
        tick();
      }
      
      function kill_timeoutfn(){
        if (typeof self.timeoutfn !== 'undefined') clearTimeout(self.timeoutfn);
      }
      
      this.abort = function(){
        if (self.pending_waiters.length > 0){
          kill_timeoutfn();
          
          self.aborted = true;
          
          for (var i in self.pending_waiters){
            self.pending_waiters[0].abort();
            
            self.aborted_waiters.push(self.pending_waiters[0]);
            
            waiter_not_pending(self.pending_waiters[0].uid);
          }
          
          
          self.endedAt = +new Date();
          
          self.onDone();
        }
      }
    };
    
    this.Waiter = function(options){
      var self = this;
      
      this.defaults = {
        test: function(){ throw "No test function for waiter defined!"; },
        interval: 100,
        timeout: 0,
        beganAt: 0,
        endedAt: 0,
        pending: false,
        successful: false,
        aborted: false
      };
      
      this.options = options;
      
      extend(this, this.defaults);
      if (typeof this.options !== 'undefined') extend(this, this.options);
      
      this.elapsed = function(){
        var elapsed = (this.pending) ? +new Date() - this.beganAt : this.endedAt - this.beganAt;
        return elapsed;
      };
      
      this.check_timeout = function(){
        return (this.elapsed() > this.timeout && this.timeout > 0);
      };
      
      this.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
      this.tick = function(success_callback){
        kill_timeoutfn();
        
        if (typeof success_callback === 'undefined') throw "No success callback function defined for waiter!";
        
        if (self.check_timeout()) self.abort();
        
        if (!self.aborted) self.timeoutfn = setTimeout(function(){
          if (self.check_timeout()) self.abort();
          
          if (self.test() && !self.aborted){
            self.pending = false;
            self.successful = true;
            self.endedAt = +new Date();
            success_callback(self.uid);
          }else if (!self.aborted){
            self.tick(success_callback);
          }
        }, self.interval);
      };
      
      this.begin = function(success_callback){
        kill_timeoutfn();
        
        self.pending = true;
        self.successful = false;
        self.aborted = false;
        self.beganAt = +new Date();
        self.endedAt = 0;
        
        self.tick(success_callback);
      };
      
      function kill_timeoutfn(){
        if (typeof self.timeoutfn !== 'undefined') clearTimeout(self.timeoutfn);
      }
      
      this.abort = function(){
        if (self.pending){
          kill_timeoutfn();
          self.pending = false;
          self.aborted = true;
          self.endedAt = +new Date();
        }
      };
    };
  };
  
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = $$waitman$$WaitMan;
  }else if(typeof define === 'function' && define.amd){
    define([], function() {
      return $$waitman$$WaitMan;
    });
  }else{
    window.WaitMan = $$waitman$$WaitMan;
  }
})();