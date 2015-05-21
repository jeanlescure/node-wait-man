(function(){
  var WaitMan = (function() {
    $$waitman$$WaitMan = function(options){
      function extend(target, extender_obj){
        for (k in extender_obj){
          target[k] = extender_obj[k];
        }
      }
      
      this.extend = extend; // For Spec's sake.
      
      this.Waiter = function(options){
        var self = this;
        var defaults = {
          test: function(){ throw "No test function for waiter defined!"; },
          interval: 100
        }
        
        extend(this, defaults);
        if (typeof options !== 'undefined') extend(this, options);
        
        this.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
        this.tick = function(success_callback){
          if (typeof success_callback === 'undefined') throw "No success callback function defined for waiter!";
          setTimeout(function(){
            if (self.test()){
              success_callback(self.uid);
            }else{
              self.tick(success_callback);
            }
          }, self.interval);
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