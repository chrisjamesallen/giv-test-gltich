uniform lowp vec4 color;
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void){
   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * color * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));; //
}
