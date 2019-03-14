// Vertex shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'attribute vec2 a_TexturePos;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec2 v_TexturePos;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '   v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '   v_Color = a_Color;\n' +
    '   v_TexturePos = a_TexturePos;\n' +
    '}\n';

// Fragment shader
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision highp float;\n' +
    '#endif\n' +
    'uniform sampler2D u_Sampler;\n' +
    'uniform vec3 u_LightColor;\n' + // for directional coming from the sun
    'uniform vec3 u_AmbientLight;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'uniform bool u_isTextured;\n' +
    'uniform float u_Limit;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec2 v_TexturePos;\n' +
    'void main() {\n' +
    '   vec3 normal = normalize(v_Normal);\n' +
    '   float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
    '   vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
    '   vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
    '   gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
    '   if(u_isTextured) {\n' +
    '       vec4 texColor = texture2D(u_Sampler, v_TexturePos);\n' +
    '       vec3 diffuse = u_LightColor * texColor.rgb * nDotL;\n' +
    '       vec3 ambient = u_AmbientLight * texColor.rgb;\n' +
    '       gl_FragColor = vec4(diffuse + ambient, texColor.a);\n' +
    '   }\n' +
    '}\n';

var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)

let currentTranslate = 0.0;

let textureBrick;
let textureGrass;
let texturePavement;

function main() {
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    let u_isTextured = gl.getUniformLocation(gl.program, 'u_isTextured');
    let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');

    if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix || !u_ProjMatrix || !u_LightColor || !u_LightDirection || !u_isTextured || !u_AmbientLight || !u_Sampler) {
        console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
        return;
    }

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(u_AmbientLight, 0.3, 0.3, 0.3);

    let lightDirection = new Vector3([2.0, 3.0, 4.0]);
    lightDirection.normalize();
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    viewMatrix.setLookAt(5, 5, 10, 0, 0, 0, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


    textureBrick = loadTexture(gl, '/textures/brick_wall.jpg');
    textureGrass = loadTexture(gl, '/textures/grass.jpg');
    texturePavement = loadTexture(gl, '/textures/pavement.jpg');

    let then = 0;
    let deltaTime = null;

    function render(now) {

        now *= 0.001;  // convert to seconds
        deltaTime = now - then;
        then = now;

        draw(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler, deltaTime);

        requestAnimationFrame(render);
    }


    document.onkeydown = function (ev) {
        keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler, deltaTime);
    };

    requestAnimationFrame(render);
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([153, 77, 26, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) { // power of 2 in both dimensions.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else { // not a power of 2.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
    console.log(image);
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler, deltaTime) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelMatrix.setTranslate(0, 0, 0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Rotate, and then translate
    modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
    modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

    gl.uniform1i(u_isTextured, true);

    let nCube = initCubeVertexBuffers(gl, 0.6, 0.3, 0.1);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    if (u_isTextured) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureBrick);
        gl.uniform1i(u_Sampler, 0);
    }
    
    //building front entrance
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.225, 0);
    modelMatrix.scale(1.5, 0.55, 1.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //front entrance columns
    pushMatrix(modelMatrix);
    modelMatrix.translate(-0.7, -0.25, 0.55);
    modelMatrix.scale(0.1, 0.5, 0.1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(14.0, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, -11.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-14.0, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(4.5, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(5.0, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, 11.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-5.0, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //building back entrance
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, -4.0);
    modelMatrix.scale(1.5, 1.0, 1.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //mid building parts
    pushMatrix(modelMatrix);
    modelMatrix.translate(-1.5, 0, 0);
    modelMatrix.scale(1.5, 1, 1.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, -4.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(2.0, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, 4.0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(1.8, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-5.6, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //side building parts
    pushMatrix(modelMatrix);
    modelMatrix.translate(-2.85, 0.1, -2.0);
    modelMatrix.scale(1.2, 1.2, 4.4);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(4.75, 0, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    nCube = initCubeVertexBuffers(gl, 0.5, 0.5, 0.5);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    if (u_isTextured) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texturePavement);
        gl.uniform1i(u_Sampler, 1);
    }

    //courtyard paving
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.55, -3.6);
    modelMatrix.scale(6.9, 0.1, 1.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, 1.2);
    modelMatrix.scale(0.1, 1, 2.3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(3.7, 0, 0);
    modelMatrix.scale(2.6, 1, 1.48);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-2.85, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //front sidewalks
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.55, -0.1);
    modelMatrix.scale(6.9, 0.1, 1.6);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-0.3, 0, 1.5);
    modelMatrix.scale(1.28, 1, 0.5);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(3.95, -0.55, 0.2);
    modelMatrix.scale(2, 0.1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-4.45, 0, 0);
    modelMatrix.scale(1.55, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //bottom bases
    pushMatrix(modelMatrix);
    modelMatrix.translate(3.95, -0.55, -0.4);
    modelMatrix.scale(2, 0.1, 0.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(-4.675, -0.55, -0.4);
    modelMatrix.scale(3.65, 0.1, 0.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.55, -4.3);
    modelMatrix.scale(4.5, 0.1, 0.4);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //rear path
    pushMatrix(modelMatrix);
    modelMatrix.translate(5.15, -0.55, -2.4);
    modelMatrix.scale(0.4, 0.1, 6.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-6, 0, -0.5);
    modelMatrix.scale(13, 1, 0.05);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.55, -5.3);
    modelMatrix.scale(1, 0.1, 3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    nCube = initCubeVertexBuffers(gl, 0.2, 0.4, 0.2);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    if (u_isTextured) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textureGrass);
        gl.uniform1i(u_Sampler, 2);
    }

    //surrounding grass
    pushMatrix(modelMatrix);
    modelMatrix.translate(-2.85, -0.55, -4.35);
    modelMatrix.scale(1.2, 0.1, 0.3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-1.75, 0, 6.2);
    modelMatrix.scale(2.6, 1, 13.5);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0.464, 0, -0.765);
    modelMatrix.scale(1.93, 1, 0.6);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(2.85, -0.55, -4.35);
    modelMatrix.scale(1.2, 0.1, 0.3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(1.12, 0, 4.8);
    modelMatrix.scale(1.3, 1, 16.3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-1.12, 0, -0.412);
    modelMatrix.scale(2.5, 1, 0.18);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0.1225, 0, -1.48);
    modelMatrix.scale(1.243, 1, 1.3);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    //courtyard grass and hedges
    pushMatrix(modelMatrix);
    modelMatrix.translate(-1, -0.55, -1.95);
    modelMatrix.scale(1.325, 0.1, 2.1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(1.51, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0.5, 0.6, 0.67);
    modelMatrix.scale(1, 2, 0.08);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-2.5, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-0.43, 0, -8.4);
    modelMatrix.scale(0.08, 1, 12.5);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(41.9, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(-1, -0.45, -3.45);
    modelMatrix.scale(1.325, 0.1, 0.168);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(1.5, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    nCube = initCubeVertexBuffers(gl, 0.2, 0.2, 0.2);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    gl.uniform1i(u_isTextured, false);

    //road
    pushMatrix(modelMatrix);
    modelMatrix.translate(-2, -0.575, 1.2);
    modelMatrix.scale(9, 0.05, 1.4);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix = popMatrix();

    let nTriangle = initTriangleVertexBuffers(gl, 0.4, 0.4, 0.4);
    if (nTriangle < 0) {
        console.log('Failed to set the triangle vertex information');
        return;
    }

    //front roof
    pushMatrix(modelMatrix);
    modelMatrix.translate(0.75, 0.7, 0.6);
    modelMatrix.scale(1.5, 0.4, 1.2);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix.translate(1, -0.4, -0.95);
    modelMatrix.scale(3, 0.2, 0.9);
    modelMatrix.rotate(90, 0, 1, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix.translate(0, 0, -1.265);
    modelMatrix.scale(1, 1, 0.34);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix.translate(0, 0, 5.5);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix = popMatrix();

    nTriangle = initTriangleVertexBuffers(gl, 0.4, 0.6, 0.4);
    if (nTriangle < 0) {
        console.log('Failed to set the triangle vertex information');
        return;
    }

    //side roofs
    pushMatrix(modelMatrix);
    modelMatrix.translate(-2.25, 0.74, 0.25);
    modelMatrix.scale(1.2, 0.08, 4.5);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix.translate(4.75, 0, 0);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix = popMatrix();

    //back roof
    pushMatrix(modelMatrix);
    modelMatrix.translate(2.25, 0.54, -4.55);
    modelMatrix.scale(4.5, 0.08, 1.08);
    modelMatrix.rotate(90, 0, 1, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriangle);
    modelMatrix = popMatrix();

    //cul de sac
    pushMatrix(modelMatrix);
    modelMatrix.translate(3, -0.6, 1.2);
    modelMatrix.scale(1.2, 0.05, 1.2);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.2, 0.2, 0.2, 20)
    modelMatrix = popMatrix();

    drawCar(gl, u_ModelMatrix, u_NormalMatrix, deltaTime);

    nCube = initCubeVertexBuffers(gl, 0.25, 0.25, 0.25);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    //street lamp
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.5, -2);
    modelMatrix.scale(0.15, 0.20, 0.15);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0.5, 0);
    modelMatrix.scale(0.4, 2, 0.4);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.3, 0.3, 0.3, 6);
    modelMatrix.translate(0, 0.9, 0);
    modelMatrix.scale(1.1, 0.3, 1.1);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 1.0, 1.0, 0.9, 20);
    modelMatrix = popMatrix();
}

function drawCar(gl, u_ModelMatrix, u_NormalMatrix, deltaTime) {
    /* Make a car */

    nCube = initCubeVertexBuffers(gl, 0.8, 0.8, 0.8);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }
    //car body
    pushMatrix(modelMatrix);
    modelMatrix.translate(currentTranslate, 0, 0);

    modelMatrix.scale(1, 1, 1);
    modelMatrix.translate(-5.38, -0.4, 1.4);
    modelMatrix.scale(1.1, 0.15, 0.5);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(-0.015, 0.8, 0);
    modelMatrix.scale(0.25, 1.37, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);

    nCube = initCubeVertexBuffers(gl, 0.5, 0.1, 0.1);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    //rear lights
    modelMatrix.translate(-1.95, -0.8, -0.34);
    modelMatrix.scale(0.04, 0.12, 0.11);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, 6.2);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);

    nCube = initCubeVertexBuffers(gl, 1, 1, 1);
    if (nCube < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    //headlights
    modelMatrix.translate(100.5, 0, -6.2);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);
    modelMatrix.translate(0, 0, 6.2);
    modelMatrix.scale(1, 1, 1);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nCube);

    let nTriPrism = initTriPrismVertexBuffers(gl, 0.8, 0.8, 0.8);
    if (nTriPrism < 0) {
        console.log('Failed to set the cube vertex information');
        return;
    }

    //rear and front windshield
    modelMatrix.translate(-82.4, 7.84, -3.11);
    modelMatrix.scale(36.3, 6.1, 9.1);
    modelMatrix.rotate(270, 0, 1, 0);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriPrism);
    modelMatrix.rotate(180, 0, 1, 0);
    modelMatrix.translate(0, 0, 1.51);
    modelMatrix.scale(1, 1, 0.65);
    drawShape(gl, u_ModelMatrix, u_NormalMatrix, nTriPrism);

    //car wheels
    modelMatrix.translate(-0.45, -1.45, 0.5);
    modelMatrix.scale(0.1, 0.49, 0.3);
    modelMatrix.rotate(90, 0, 0, 1);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.3, 0.3, 0.3, 20);
    modelMatrix.translate(0, 0, -10);
    modelMatrix.scale(1, 1, 1);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.3, 0.3, 0.3, 20);
    modelMatrix.translate(0, -9.9, 0);
    modelMatrix.scale(1, 1, 1);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.3, 0.3, 0.3, 20);
    modelMatrix.translate(0, 0, 10);
    modelMatrix.scale(1, 1, 1);
    drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, 0.3, 0.3, 0.3, 20);

    modelMatrix = popMatrix();

    if (currentTranslate <= 8.8) {
        currentTranslate += deltaTime * 0.8;
    }
    else if (currentTranslate >= 0) {
        currentTranslate = 0;
    }
}

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler, deltaTime) {
    switch (ev.keyCode) {
        case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
            g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
            break;
        case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
            g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
            break;
        case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
            g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
            break;
        case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
            g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
            break;
        default: return; // Skip drawing at no effective action
    }

    // Draw the scene
    draw(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler, deltaTime);
}