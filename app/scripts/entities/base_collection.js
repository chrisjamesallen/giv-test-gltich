"use strict";

window.app.module("Entities", function (module, app, Backbone, Marionette, $, _) {

  // Collection Override
  // --------------------------
  var Model = Backbone.Model.extend({
    isSelected: function () {
      return this.collection.getSelected() === this;
    },
    getIndex: function () {
      return this.collection.indexOf(this);
    },
    select: function () {
      if (this.collection) {
        this.collection.setSelected(this);
      }
    }
  });

  _.extend(Backbone.Collection.prototype, {

    model: Model,

    setIndex: function (index) {
      var a, b;

      if (!this.length) return;
      if (index < 0) {
        index = this.length - 1;
      } else if (index >= this.length) {
        index = 0;
      }
      a = this.findWhere({state: 'selected'});
      b = this.at(index);
      if (a && a !== b) {
        a.set('state', '');
      }
      b.set('state', 'selected');
      this.selected = b;
      return index;
    },

    setSelected: function (model) {
      var cur;
      cur = this.findWhere({state: 'selected'});
      if (cur && cur !== model) {
        cur.set('state', '');
      }
      model.set('state', 'selected');
    },

    deselect: function (model){
      var cur;
      cur = model || this.findWhere({state: 'selected'});
      if(cur){
        cur.set('state','');
      }
    },

    getIndex: function () {
      var a = this.findWhere({state: 'selected'});
      return (a) ? this.indexOf(a) : 0;
    },

    getSelected: function () {
      return this.findWhere({state: 'selected'});
    },

    previous: function () {
      var i = this.setIndex(this.getIndex() - 1);
    },

    next: function () {
      var i = this.setIndex(this.getIndex() + 1);
    }

  });

});