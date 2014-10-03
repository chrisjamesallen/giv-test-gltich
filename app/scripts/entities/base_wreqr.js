"use strict";

window.app.module("Entities", function (module, app, Backbone, Marionette, $, _) {

  _.extend(Backbone.Wreqr, {

    createStateChannel: function(){
      var channel = new this.Channel();
      channel.state = new Backbone.Model();
      return channel;
    }

  });



});