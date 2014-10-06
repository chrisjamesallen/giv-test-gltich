"use strict";

window.app.module("Entities", function (module, app, Backbone, Marionette, $, _) {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

  var Texture = Marionette.Object.extend({

    COORDS: [

      /*t:*/ 1.0, 1.0, //top right
      /*t:*/ 1.0, 0.0, //bottom right
      /*t:*/ 0.0, 0.0, //bottomleft

      /*t:*/ 0.0, 0.0, //bottomleft
      /*t:*/ 0.0, 1.0, //top left
      /*t:*/ 1.0, 1.0 //top right

    ],


    initialize: function (options) {
      this.url = options.url;
      this.gl = options.gl;
      this.tex = this.gl.createTexture();
    },

    loadURL: function (url) {
      var img;
      img = new Image();
      this.el = img;
      img.onload = _.bind(this.callbacks.onLoad, this);
      img.src = url || this.url;
    },

    callbacks: {
      onLoad: function () {
        this.isLoaded = true;
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
       // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.el);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }

  });

  var VideoTexture = Texture.extend({
    initialize: function (options) {
      this.url = options.url;
      this.gl = options.gl;
      this.tex = this.gl.createTexture();
      this.$video = $('<video>').appendTo($('body'));
      this.$video.attr('src',this.url);
    },
    loadURL: function (url) {
      var $video = this.$video;
      $video.attr('src',url|| this.url);
      $video[0].addEventListener('playing', _.bind(this.callbacks.onLoad,this));
      $video[0].play();
      $video.prop('muted',true);
      $video.prop('loop',true);
      this.el = $video[0];
      return $video;
    }

  });


  // 3d Object

  var Object = Marionette.Object.extend({

    VERTICES_: [.5, .5, 0, -.5, .5, 0, .5, -.5, 0, -.5, -.5, 0   ],
    VERTICES__: [ /* bottom triangle */  -1, -1, 0, 1, 1, 0, 1, -1, 0, /*top triangle*/-1, -1, 0, -1, 1, 0, 1, 1, 0  ],
    VERTICES: [
      /*v:*/-1.000000, -1.000000, -0.000000,
      /*v:*/-1.000000, 1.000000, -0.000000,
      /*v:*/1.000000, 1.000000, -0.000000,

      /*v:*/1.000000, 1.000000, -0.000000,
      /*v:*/1.000000, -1.000000, -0.000000,
      /*v:*/-1.000000, -1.000000, -0.000000
    ],

    FRAGMENT_GLSL_PATH: 'scripts/shaders/default/frag.glsl',
    VERTICES_GLSL_PATH: 'scripts/shaders/default/vert.glsl',
    DEFAULT_TEX_PATH: 'assets/images/hed_.jpg',

    initialize: function (options) {
      this.gl = options.gl;
      this.glsl = {};
      this.isLoaded = false;
      this.texture = options.texture;
      this.verticesCount = this.VERTICES.length / 3;
      this.loadShaderFiles();
    },

    loadShaderFiles: function () {
      var self = this;
      $.get(self.VERTICES_GLSL_PATH, function (data) {
        self.glsl.vert = {};
        self.glsl.vert.src = data;

        $.get(self.FRAGMENT_GLSL_PATH, _.bind(function (data) {
          this.glsl.frag = {};
          this.glsl.frag.src = data;
          _.bind(this.callbacks.onLoadedGLSL, this)();
        }, self));

      });
    },

    createShaderType: function (obj, type) {
      var gl = this.gl;

      if (type === 'vert') {
        obj.shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(obj.shader, obj.src);
      }

      if (type === 'fragment') {
        obj.shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(obj.shader, obj.src);
      }

      gl.compileShader(obj.shader);

      if (!gl.getShaderParameter(obj.shader, gl.COMPILE_STATUS)) {
        console.warn("gl error", gl.getShaderInfoLog(obj.shader));
        return null;
      }
    },

    createProgram: function () {

      var gl = this.gl;
      var prog = gl.createProgram();

      gl.attachShader(prog, this.glsl.vert.shader);
      gl.attachShader(prog, this.glsl.frag.shader);
      gl.linkProgram(prog);

      // check compilation
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('fail with shaders');
      }
      this.program = prog;
    },

    openVAO: function () {

      var vao, vbo, ext, gl;
      gl = this.gl;
      this.ext = ext = (!this.ext) ? gl.getExtension("OES_vertex_array_object") : this.ext;
      this.vao = vao = (!this.vao) ? this.ext.createVertexArrayOES() : this.vao;
      ext.bindVertexArrayOES(vao);
    },

    closeVAO: function () {

      this.ext.bindVertexArrayOES(null);
    },

    getAttribute: function (key) {
      var loc = this.gl.getAttribLocation(this.program, key);
      if (loc == -1) console.warn('error getting attribute', key);
      return loc;
    },

    glGetUniform: function (key) {
      var loc = this.gl.getUniformLocation(this.program, key);
      if (loc == -1) console.warn('error getting uniform', key);
      return loc;
    },

    setMeshToInput: function (attribute, data, perVert) {
      var positionAttrib, gl, vbo, ext;
      gl = this.gl;
      ext = this.ext;
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      positionAttrib = this.getAttribute(attribute);//grab array loc
      console.log('attrib', attribute, positionAttrib);
      gl.enableVertexAttribArray(positionAttrib);//place in here attribute position.
      gl.vertexAttribPointer(positionAttrib, perVert || 2, gl.FLOAT, false, 0, 0);
    },

    callbacks: {
      onLoadedGLSL: function () {
        this.createShaderType(this.glsl.vert, 'vert');
        this.createShaderType(this.glsl.frag, 'fragment');
        this.createProgram();
        this.openVAO();
        this.setMeshToInput('vertexPos', this.VERTICES, 3);
        this.setMeshToInput('aTextureCoord', this.texture.COORDS, 2);
        this.closeVAO();
        this.texture.loadURL();
        this.isLoaded = true;
      }
    },


    //Public

    update: function () {
      // place matrices in here
    },

    setTexture: function (url) {
      this.texture = new Texture({"url": url || this.DEFAULT_TEX_PATH, gl: this.gl});
    },

    draw: function () {
      if (this.isLoaded && this.texture.isLoaded) {
        this.gl.useProgram(this.program);
        this.ext.bindVertexArrayOES(this.vao);
        //point to uniform
        var color = vec4.fromValues(1, 0, 0, 1);
        gl.uniform4fv(this.glGetUniform('color'), color);
        //texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.tex);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.el);


        var loc = gl.getUniformLocation(this.program, "uSampler");
        gl.uniform1i(loc, 0);
        //draw data
        gl.drawArrays(gl.TRIANGLES, 0, this.verticesCount);
        //this.ext.bindVertexArrayOES(null);
      }

    }
  });


  // 3d view

  var CanvasView = Marionette.ItemView.extend({

    AUTOPLAY: true,

    class: 'container-canvas',
    tagName: 'canvas',

    initialize: function () {
      this.delegateChannelEvents();
    },

    setEvents: function () {
      var $w = $(window);
      $w.on('resize', this.callbacks.events.onResize);
    },

    setContext: function () {
      this.gl = this.el.getContext("experimental-webgl");
      window.gl = this.gl;
    },

    setViewport: function () {
      this.gl.viewport(0, 0, this.el.width, this.el.height);
    },

    setRunLoop: function () {
      requestAnimationFrame(_.bind(this.onUpdate, this));
    },

    setObject: function () {
    },

    callbacks: {

      onRender: function () {
        this.setContext();
        this.el.width = 1000;
        this.el.height = 642;
        this.makeCenter();
        this.setViewport();
        this.setEvents();
        this.setObject();
        console.log('CanvasView>> gl context', this.gl);
      },

      onShow: function () {
        this.run = true;
        if (this.AUTOPLAY) this.setRunLoop();
      },

      onUpdate: function () {
        this._update();
        this._draw();
        if (this.run) {
          window.requestAnimationFrame(_.bind(this.onUpdate, this));
        }
      },
      onResize: function () {
        this.setViewport();
      }
    },

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

    // Public
    start: function () {
      this.run = true;
      this.setRunLoop();
    },
    stop: function () {
      this.run = false;
    }
  });



  module.Plane = Object;
  module.Canvas = CanvasView;
  module.ImageTexture = Texture;
  module.VideoTexture = VideoTexture;
});