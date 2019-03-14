let g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
    return g_matrixStack.pop();
}

function initCubeVertexBuffers(gl, r, g, b) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let vertices = new Float32Array([   // Coordinates
        0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
        0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
        0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
       -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
       -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
        0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
    ]);


    let colors = new Float32Array([
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v0-v1-v2-v3 front
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v0-v3-v4-v5 right
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v0-v5-v6-v1 up
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v1-v6-v7-v2 left
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v7-v4-v3-v2 down
        r, g, b,   r, g, b,   r, g, b,   r, g, b,     // v4-v7-v6-v5 back
    ]);

    let textureCoordinates = new Float32Array([
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0, // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0, // v4-v7-v6-v5 back
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0, // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0, // v0-v3-v4-v5 right
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0 // v1-v6-v7-v2 left
    ]);

    let normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);


    // Indices of the vertices
    let indices = new Uint8Array([
         0, 1, 2,   0, 2, 3,    // front
         4, 5, 6,   4, 6, 7,    // right
         8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_TexturePos', textureCoordinates, 2, gl.FLOAT)) return -1;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initTriangleVertexBuffers(gl, r, g, b) {
    // Create a 3D triangle
    let vertices = new Float32Array([   // Coordinates
        -0.5, 0.5, 0.0,  -1.0,-0.5, 0.0,   0.0,-0.5, 0.0, // front
        -0.5, 0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5,-1.0,  -0.5, 0.5,-1.0, // right
        -0.5, 0.5, 0.0,  -0.5, 0.5,-1.0,  -1.0,-0.5,-1.0,  -1.0,-0.5, 0.0, // left
        -1.0,-0.5,-1.0,   0.0,-0.5,-1.0,   0.0,-0.5, 0.0,  -1.0,-0.5, 0.0, // bottom
        -0.5, 0.5,-1.0,  -1.0,-0.5,-1.0,   0.0,-0.5,-1.0 // back
    ]);


    let colors = new Float32Array([
        r, g, b,   r, g, b,   r, g, b,
        r, g, b,   r, g, b,   r, g, b,   r, g, b,
        r, g, b,   r, g, b,   r, g, b,   r, g, b,
        r, g, b,   r, g, b,   r, g, b,   r, g, b,
        r, g, b,   r, g, b,   r, g, b
    ]);

    let normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, // front
        0.6, 0.4, 0.0,   0.6, 0.4, 0.0,   0.6, 0.4, 0.0,   0.6, 0.4, 0.0, // right
       -0.6, 0.4, 0.0,  -0.6, 0.4, 0.0,  -0.6, 0.4, 0.0,  -0.6, 0.4, 0.0, // left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0, // bottom
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0 // back
    ]);


    // Indices of the vertices
    let indices = new Uint8Array([
        0, 1, 2, // front
        3, 4, 5,   3, 5, 6, // right
        7, 8, 9,   7, 9,10, // left
       11,12,13,  11,13,14, // bottom
       15,16,17 // back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initTriPrismVertexBuffers(gl, r, g, b) {
    // Create a 3D triangular prism
    let vertices = new Float32Array([   // Coordinates
        0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // front
        0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // right
       -0.5,-0.5, 0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5, // left
       -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // down
        0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5 // back
    ]);


    let colors = new Float32Array([
        r, g, b, r, g, b, r, g, b, r, g, b,
        r, g, b, r, g, b, r, g, b,
        r, g, b, r, g, b, r, g, b,
        r, g, b, r, g, b, r, g, b, r, g, b,
        r, g, b, r, g, b, r, g, b, r, g, b
    ]);


    let normals = new Float32Array([
        0.0, 0.4, 0.6,   0.0, 0.4, 0.6,   0.0, 0.4, 0.6,   0.0, 0.4, 0.6,  // front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0, // right
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, // left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0, // bottom
        0.0, 0.4,-0.6,   0.0, 0.4,-0.6,   0.0, 0.4,-0.6,   0.0, 0.4,-0.6  // back
    ]);


    // Indices of the vertices
    let indices = new Uint8Array([
        0, 1, 2,   0, 2, 3, // front
        4, 5, 6, // right
        7, 8, 9, // left
       10,11,12,  10,12,13, // bottom
       14,15,16,  14,16,17 // back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initCylinderVertexBuffers(gl, r, g, b, segments, isTop, isSide) {
    let vertices = [];
    let indices = [];

    if (isTop) {
        addCirclePoints(vertices, indices, r, g, b, segments, isTop);
    }
    else if (isSide) {
        addCylinderPoints(vertices, indices, r, g, b, segments);
    }
    else {
        addCirclePoints(vertices, indices, r, g, b, segments, isTop);
    }

    vertices = new Float32Array(vertices);
    indices = new Uint8Array(indices);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return indices.length;
}

function addCirclePoints(vertices, indices, r, g, b, segments, isTop) {
    let y = 0;
    theta = ((Math.PI * 2) / segments);
    for (i = 0; i <= segments; i++) {
        x = Math.cos(theta * i);
        z = Math.sin(theta * i);
        if (isTop) {
            vertices.push(x, y + 1, z); //top vertices
            vertices.push(0.0, 0.0);
        }
        else {
            vertices.push(x, y, z); //bottom vertices
            vertices.push(0.0, 0.0);
        }
        vertices.push(0.0, 1.0, 0.0);
        indices.push(indices.length);
        vertices.push(r, g, b);
    }
}

function addCylinderPoints(vertices, indices, r, g, b, segments) {
    let y = 0;
    theta = ((Math.PI * 2) / segments);
    for (i = 0; i <= segments; i++) {
        x = Math.cos(theta * i);
        z = Math.sin(theta * i);
        vertices.push(x, y, z); //bottom side vertices
        vertices.push(0.0, 0.0);
        normalizePush(x, z, vertices);
        vertices.push(r, g, b);
        indices.push(indices.length);
        vertices.push(x, y + 1, z); //top side vertices
        vertices.push(0.0, 0.0);
        normalizePush(x, z, vertices);
        vertices.push(r, g, b);
        indices.push(indices.length);
    }
}

function normalizePush(x, z, vertices) {
    let norm = Math.sqrt(x * x + z * z);
    nx = x / norm;
    nz = z / norm;
    vertices.push(nx, 0, nz);
}

function initArrayBuffer(gl, attribute, data, num, type) {

    let buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    let a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}

function drawShape(gl, u_ModelMatrix, u_NormalMatrix, n) {
    pushMatrix(modelMatrix);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    modelMatrix = popMatrix();
}

function drawCylinder(gl, u_ModelMatrix, u_NormalMatrix, r, g, b, segments) {
    pushMatrix(modelMatrix);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    drawCylinderPart(gl, r, g, b, segments, true, false); //top
    drawCylinderPart(gl, r, g, b, segments, false, false); //bottom
    drawCylinderPart(gl, r, g, b, segments, false, true); //sides

    modelMatrix = popMatrix();
}

function drawCylinderPart(gl, r, g, b, segments, isTop, isSide) {
    let stride = (3 + 2 + 3 + 3) * 4; //4 bytes per vertex

    let n = initCylinderVertexBuffers(gl, r, g, b, segments, isTop, isSide);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, n, gl.STATIC_DRAW);

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);

    let textureOffset = 3 * 4;
    a_TexturePos = gl.getAttribLocation(gl.program, 'a_TexturePos');
    gl.vertexAttribPointer(a_TexturePos, 2, gl.FLOAT, false, stride, textureOffset);
    gl.enableVertexAttribArray(a_TexturePos);

    let normalOffset = (3 + 2) * 4;
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, stride, normalOffset);
    gl.enableVertexAttribArray(a_Normal);

    let colorOffset = (3 + 3 + 2) * 4;
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, stride, colorOffset);
    gl.enableVertexAttribArray(a_Color);

    if (!isSide) {
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
    else {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}