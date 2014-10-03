"use strict";

window.app.module("Entities", function (module, app, Backbone, Marionette, $, _) {


//   fit.defaults.watch = true;

  // Marionette View Overide
  // --------------------------
  _.extend(Marionette.View.prototype, {

    channelEvents: {
    },

    events:{

    },

    template: _.template(''),

    channel: [],

    setCallbacks: function () {
      var ev, callbacks;
      ev = this.events || {};  // use this to avoid overwriting events object
      callbacks = {};
      _.extend(callbacks, (this.__super__)? this.__super__.callbacks : {});
      _.extend(callbacks,this.callbacks);
      _.extend(this, this.callbacks = callbacks);
      this.events = ev;
      _.each(_.keys(this.callbacks), _.bind(function (key, index, list) {
        this.callbacks.events = this.callbacks.events || {};
        if(_.isFunction(this[key])){
          this.callbacks.events[key] = _.bind(this[key], this);
        }
      }, this));
    },

    delegateChannelEvents: function (ev) {
      var events;
      events = this.channelEvents || ev || {};
      this.setCallbacks();
      var reg = /(\w+):\s?(\w+)\s([\s\S]+)/i;
      _.each(_.keys(events), _.bind(function (str, index, list) {
        var matches, obj, key, channel, channelStr, callback;
        matches = str.match(reg);
        if (!_.isEmpty(matches)) {
          channelStr = matches[0 + 1];
          obj = matches[1 + 1];
          key = matches[2 + 1];
          if(channelStr==="self"){
            channel = this.channel || [];
          } else{
            channel = Backbone.Wreqr.radio.channel(channelStr,callback);
          }
          callback = events[str];
          this.callbacks.events[callback] = _.bind(this[callback], this);
          this.listenTo(channel[obj], key, this.callbacks.events[callback]);
        }
      }, this));

    },

    callbacks: {
    },

    makeCenter: function () {
      this.$el.addClass('midway-horizontal midway-vertical');
      Midway();
    }


  });


  //Backbone.Marionette.Controller = Marionette.View;

});