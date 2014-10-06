precision highp float;
#define BLOCKS 20


uniform highp float u_time;
uniform lowp vec4 color;
varying highp vec2 vTextureCoord;


uniform sampler2D sampler0;
uniform sampler2D sampler1;


// take in positionable value to place in blocks
vec2 getBlock(vec2 pos){
  float width = 1000.0;
  float height = 642.0;
  float block = 80.0;
  float blockWidth = width/block; //eg say 50px
  float x = (width * pos.x);
  float y = (height* pos.y);
  float col  = x / block;
  float row =  y / block;
  return vec2(col,row);
}


void video1(int videoNum, float offset){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0)  * texture2D(sampler0, vec2(vTextureCoord.s, vTextureCoord.t));
}
void video2(int videoNum, float offset){
   float seconds = u_time/100.0;
   float speed = 0.05;
   float t = 1.0; // (1.0 + sin(seconds * speed)) / 2.0;
   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0)  * texture2D(sampler1, vec2( fract(vTextureCoord.s + t), fract(vTextureCoord.t))   );
}

void colorBlock(in vec2 pos){
  vec2 a = getBlock(pos);
  // so alternate video
  int b = int( mod(a.x, 2.0) );
  if(b == 1){
    video2(0, 20.0);
  } else{
    video2(0, 0.0);
  }
}

void success(){
  gl_FragColor = vec4(0.0, 1.0, 0.6, 1.0);
}

void fail(){
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  discard;
}


void main(void){
   // this splits up the tex cord into vertical blocks
   colorBlock(vTextureCoord);
}
