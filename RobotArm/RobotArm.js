﻿"use strict";

var canvas;
var gl;

var NumVertices = 36;

var points = [];
var colors = [];

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

// RGBA colors
var vertexColors = [
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];


// Parameters controlling the size of the Robot's arm
var BASE_HEIGHT = 2.0;
var BASE_WIDTH = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH = 0.5;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;

// Array of rotation angles (in degrees) for each rotation axis
var theta = [0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;



window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    var projectionLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));

    document.getElementById("slider1").oninput =
        function (event) {
            theta[Base] = event.target.value;
        };

    document.getElementById("slider2").oninput =
        function (event) {
            theta[LowerArm] = event.target.value;
        };

    document.getElementById("slider3").oninput =
        function (event) {
            theta[UpperArm] = event.target.value;
        };

    render();
}

function quad(a, b, c, d) {
    colors.push(vertexColors[c]);
    points.push(vertices[a]);
    colors.push(vertexColors[c]);
    points.push(vertices[b]);
    colors.push(vertexColors[c]);
    points.push(vertices[c]);
    colors.push(vertexColors[c]);
    points.push(vertices[a]);
    colors.push(vertexColors[c]);
    points.push(vertices[c]);
    colors.push(vertexColors[c]);
    points.push(vertices[d]);
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function base() {
    var s = scalem(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}


function upperArm() {
    var s = scalem(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}


function lowerArm() {
    var s = scalem(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = rotate(theta[Base], 0, 1, 0);
    base();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1));
    lowerArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1));
    upperArm();

    requestAnimFrame(render);
}