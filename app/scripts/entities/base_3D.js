"use strict";

window.app.module("Entities", function (module, app, Backbone, Marionette, $, _) {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

  var Object = Marionette.Object.extend({

    VERTICES_: [.5, .5, 0,   -.5, .5, 0,    .5, -.5, 0,    -.5, -.5, 0   ],
    VERTICES: [ /* bottom triangle */  -1,-1,0, 1, -1, 0,   1, 1, 0, /*top triangle*/-1,-1,0,  -1,1,0, 1,1,0  ],
    FRAGMENT_GLSL_PATH: 'scripts/shaders/default/frag.glsl',
    VERTICES_GLSL_PATH: 'scripts/shaders/default/vert.glsl',

    initialize: function (options) {
      this.gl = options.gl;
      this.glsl = {};
      this.isLoaded = false;
      this.verticesCount = this.VERTICES.length/3;
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
          _.bind(this.callbacks.onLoadedGLSL,this)();
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
      this.ext = ext = (!this.ext)? gl.getExtension("OES_vertex_array_object"): this.ext;
      this.vao = vao = (!this.vao)? this.ext.createVertexArrayOES(): this.vao;
      ext.bindVertexArrayOES(vao);
    },

    closeVAO: function () {
      this.ext.bindVertexArrayOES(null);
    },

    getAttribute: function (key) {
      var loc = this.gl.getAttribLocation(this.program, key);
      if(loc == -1) console.warn('error getting attribute',key);
      return loc;
    },

    glGetUniform: function (key) {
      var loc = this.gl.getUniformLocation(this.program, key);
      if(loc == -1) console.warn('error getting uniform',key);
      return loc;
    },


    setMeshToInput: function(attribute,data,perVert){
      var positionAttrib, gl, vbo, ext;
      gl = this.gl;
      ext =this.ext;
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      positionAttrib = this.getAttribute(attribute);//grab array loc
      gl.enableVertexAttribArray(positionAttrib);//place in here attribute position.
      gl.vertexAttribPointer(positionAttrib, perVert|| 3, gl.FLOAT, false, 0, 0);
    },

    callbacks: {
      onLoadedGLSL: function () {
        this.createShaderType(this.glsl.vert, 'vert');
        this.createShaderType(this.glsl.frag, 'fragment');
        this.createProgram();
        this.openVAO();
        this.setMeshToInput('vertexPos', this.VERTICES, 3);
        this.closeVAO();
        this.isLoaded = true;
      }
    },


    //Public

    update: function () {
      // place matrices in here
    },

    draw: function () {
      if(this.isLoaded){
        this.gl.useProgram(this.program);
        this.ext.bindVertexArrayOES(this.vao);
        //point to uniform
        var color = vec4.fromValues(1,0,0,1);
        gl.uniform4fv(this.glGetUniform('color'),  color);
        gl.drawArrays(gl.TRIANGLES, 0,this.verticesCount);
        //this.ext.bindVertexArrayOES(null);
      }

    }


  });

  module.Square = Object;

});