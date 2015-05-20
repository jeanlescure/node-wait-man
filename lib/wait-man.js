(function(){
  var WaitMan = (function() {
    $$waitman$$WaitMan = function(options){
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