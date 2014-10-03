"use strict";

window.app.module("Entities.Models", function (module, app, Backbone, Marionette, $, _) {

  _.extend(Backbone.Model.prototype,{
        toggle: function(key){
          if(this.get(key)){
            this.set(key,false);
            return false;
          }else{
            this.set(key,true);
            return true;
          }
        }
  });

});