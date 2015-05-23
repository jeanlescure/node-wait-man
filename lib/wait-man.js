(function(){
  var WaitMan = (function() {
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
        
        function tick(){
          if (!self.aborted) self.timeout = setTimeout(function(){
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
          
          resetWaiterLists();
          self.aborted = false;
          
          for (var i in self.pending_waiters){
            self.pending_waiters[i].begin(onSuccess);
          }
          
          tick();
        }
        
        function kill_timeout(){
          if (typeof self.timeout !== 'undefined') clearTimeout(self.timeout);
        }
        
        this.abort = function(){
          if (self.pending_waiters.length > 0){
            kill_timeout();
            
            self.aborted = true;
            
            for (var i in self.pending_waiters){
              self.pending_waiters[0].abort();
              
              self.aborted_waiters.push(self.pending_waiters[0]);
              
              waiter_not_pending(self.pending_waiters[0].uid);
            }
            
            self.onDone();
          }
        }
      };
      
      this.Waiter = function(options){
        var self = this;
        
        this.defaults = {
          test: function(){ throw "No test function for waiter defined!"; },
          interval: 100,
          pending: false,
          successful: false,
          aborted: false
        };
        
        this.options = options;
        
        extend(this, this.defaults);
        if (typeof this.options !== 'undefined') extend(this, this.options);
        
        this.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
        this.tick = function(success_callback){
          kill_timeout();
          
          if (typeof success_callback === 'undefined') throw "No success callback function defined for waiter!";
          
          if (!self.aborted) self.timeout = setTimeout(function(){
            if (self.test()){
              self.pending = false;
              self.successful = true;
              success_callback(self.uid);
            }else{
              self.tick(success_callback);
            }
          }, self.interval);
        };
        
        this.begin = function(success_callback){
          kill_timeout();
          
          self.pending = true;
          self.successful = false;
          self.aborted = false;
          
          self.tick(success_callback);
        };
        
        function kill_timeout(){
          if (typeof self.timeout !== 'undefined') clearTimeout(self.timeout);
        }
        
        this.abort = function(){
          if (!self.successful){
            kill_timeout();
            self.pending = false;
            self.aborted = true;
          }
        };
      };
    };
    
    return $$waitman$$WaitMan;
  })();
  
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = WaitMan;
  }else if(typeof define === 'function' && define.amd){
    define([], function() {
      return WaitMan;
    });
  }else{
    window.WaitMan = WaitMan;
  }
})();