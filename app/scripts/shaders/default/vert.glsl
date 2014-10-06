attribute vec3 vertexPos;
attribute vec2 aTextureCoord;
varying highp vec2 vTextureCoord;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// lets start by making some blocks fading this out


void main(void) {
    // Return the transformed and projected vertex value
    gl_Position =   vec4(vertexPos, 1.0); // projectionMatrix * modelViewMatrix *
    vTextureCoord = aTextureCoord;
}
