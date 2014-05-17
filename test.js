var gl; // A global variable for the WebGL context
var vertexPositionAttribute;
var shaderProgram;

var spherePositionBuffer;
var sphereIndexBuffer;


function run(){
	drawScene();
}

function start() {
	var canvas = document.getElementById("glcanvas");
	
	gl = initWebGL(canvas);      // Initialize the GL context

	// Only continue if WebGL is available and working

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
		gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
		gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	}
	
	initShaders();
	
	genSphere(30, 30, 600);
	
	runProgram();
}

function runProgram(){

	var counter = 0;
	
	var looper = setInterval(function(){
		counter++
		run();
		if(counter >= 750){
			clearInterval(looper);
		}
	
	}, 15);
	
}

function genSphere(latitude, longitude, radius)
{

	spherePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
	sphereIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);

	var spherePositionArray = [];
	var sphereColorArray = [];
	var sphereIndexArray = [];
	
	for (var lat=0; lat <= latitude; lat++){
		var theta = lat * Math.PI / latitude;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		
		for( var lon = 0; lon <= longitude; lon++){
			var phi = lon * 2 * Math.PI / longitude;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
			
            spherePositionArray.push(radius * x);
            spherePositionArray.push(radius * y);
            spherePositionArray.push(radius * z);
	
		}
	}
	
	for (var lat=0; lat < latitude; lat++){
		
		for( var lon = 0; lon < longitude; lon++){
		
			var first = (lat * (longitude + 1)) + lon;
            var second = first + longitude + 1;
            sphereIndexArray.push(first);
            sphereIndexArray.push(second);
            sphereIndexArray.push(first + 1);

            sphereIndexArray.push(second);
            sphereIndexArray.push(second + 1);
            sphereIndexArray.push(first + 1);
		}
	}
		
		
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spherePositionArray), gl.STATIC_DRAW);
	spherePositionBuffer.itemSize = 3;
	spherePositionBuffer.numItems = spherePositionArray.length / 3;

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndexArray), gl.STATIC_DRAW);
	sphereIndexBuffer.itemSize = 1;
	sphereIndexBuffer.numItems = sphereIndexArray.length;

}
	
function initWebGL(canvas) {
	gl = null;

	try {
		// Try to grab the standard context. If it fails, fallback to experimental.
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(e) {}

	// If we don't have a GL context, give up now
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
		gl = null;
	}

	return gl;
}


function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs-sphere");
	var vertexShader = getShader(gl, "shader-vs-sphere");

	// Create the shader program

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
}


function getShader(gl, id) {
	var shaderScript, theSource, currentChild, shader;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	theSource = "";
	currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		// Unknown shader type
		return null;
	}
	gl.shaderSource(shader, theSource);

	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
	  alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
	  return null;  
	}

	return shader;
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspectiveMatrix = makePerspective(45, 1.0, 0.1, 1000.0);

	loadIdentity();
	mvTranslate([0.0, 0.0, -5.0]);
	

	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, spherePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    setMatrixUniforms();
	
	var cUniform = gl.getUniformLocation(shaderProgram, "vColor");
	gl.uniform4f(cUniform, 1.0, 1.0, 0.0, 1.0);
	
    gl.drawElements(gl.LINE_STRIP, sphereIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}




