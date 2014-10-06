console.log(' module video ');
window.app.module('Video', function (MyModule, App, Backbone, Marionette, $, _) {


  var VIDEOS = [
    { 'url': 'assets/video/test.mp4' }
  ];


  glitchView = App.Entities.Canvas.extend({

    _update: function () {
      // now mac does swap buffer for us..., need to implement here
      this.obj.update();
    },

    _draw: function () {
      var gl = this.gl;
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.obj.draw();
    },

    setObject: function () {
      var tex = new App.Entities.VideoTexture({"url": "assets/video/tim.mp4", gl: this.gl});
      this.obj = new App.Entities.Plane({gl: this.gl, texture: tex});
    }

  });


  App.on('start', function () {
    var $body = $('body');
    var layer = new glitchView();
    window.app.body.show(layer);
    window.layer = layer;
  });

});
