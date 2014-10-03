console.log(' module video ');
window.app.module('Video',function(MyModule, App, Backbone, Marionette, $, _){


    var VIDEOS = [
      { 'url':'assets/video/test.mp4' }
    ];



    var CanvasView = Marionette.ItemView.extend({

        AUTOPLAY: true,

        class:'container-canvas',
        tagName:'canvas',

        initialize: function(){
           this.delegateChannelEvents();
        },

        setEvents: function(){
          var $w = $(window);
          $w.on('resize',this.callbacks.events.onResize);
        },

        setContext: function(){
            this.gl = this.el.getContext("experimental-webgl");
          window.gl = this.gl;
        },

        setViewport: function(){
            this.gl.viewport(0,0,this.el.width,this.el.height);
        },

        setRunLoop: function(){
            requestAnimationFrame(_.bind(this.onUpdate,this));
        },

        setObject: function(){
           this.obj = new  App.Entities.Square({gl:this.gl});
        },

        callbacks:{
           onRender: function(){
            this.setContext();
            this.el.width = 900;
            this.el.height = 600;
            this.makeCenter();
            this.setViewport();
            this.setEvents();
            this.setObject();
            console.log('CanvasView>> gl context', this.gl);
           },

           onShow: function(){
             this.run = true;
             if(this.AUTOPLAY) this.setRunLoop();
           },

           onUpdate: function(){
             this._update();
             this._draw();
             if(this.run){
                window.requestAnimationFrame(_.bind(this.onUpdate,this));
             }
           },
           onResize: function(){
               this.setViewport();
           }
        },

        _update: function(){

            // now mac does swap buffer for us..., need to implement here
           this.obj.update();
        },

        _draw: function(){
          var gl = this.gl;
          gl.clearColor(0,0,0,1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          this.obj.draw();
        },

        // Public

        start: function(){
            this.run = true;
            this.setRunLoop();
        },
        stop: function(){
            this.run = false;
        }
    });


    App.on('start', function(){
        // so lets create a canvas and set up some gl
        var $body = $('body');
        var layer = new CanvasView();
        window.app.body.show(layer);
        window.layer = layer;

    });

});
