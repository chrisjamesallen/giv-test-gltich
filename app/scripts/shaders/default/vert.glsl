attribute vec3 vertexPos;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main(void) {
    // Return the transformed and projected vertex value
    gl_Position =   vec4(vertexPos, 1.0); // projectionMatrix * modelViewMatrix *
}
