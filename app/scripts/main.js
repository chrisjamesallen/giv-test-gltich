console.log('\'Allo \'Allo!');

var Givenchy = (function(){

//

  window.app = new Backbone.Marionette.Application({
    regions:{
      body: '.container'
    }
  });
  window.channel = Backbone.Wreqr.radio.channel('global');
 


  $(function(){
     window.app.start();
  });

})();
