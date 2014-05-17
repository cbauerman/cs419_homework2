var gl; // A global variable for the WebGL context
var vertexPositionAttribute;
var shaderProgram;

var spherepositionBuffer;
var sphereindexBuffer;

var objects = [];

var light = {};

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

	init();
	
	objects.push(genSphere(30, 30, 1));
	objects[0].translate = [0.0, 0.0, 0.0];
	objects[0].ambient = $V([1.0, 0.0, 1.0, 1.0]);
	objects[0].diffuse = $V([1.0, 0.5, 0.0, 1.0]);
	objects[0].specular = $V([1.0, 0.5, 0.0, 1.0]);
	objects[0].shininess = 400.0;
	//objects.push(genCylinder(2, 1, 30, 30));
	//objects[1].translate = [0.0, 1.0, 0.0];
	

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


function genCylinder(height, radius, v_lines, h_lines)
{
	var cyl = {};
	cyl.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cyl.positionBuffer);
	cyl.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cyl.indexBuffer);

	var cylPositionArray = [];
	var cylIndexArray = [];
	
	var indAcc = 0;
	var h;
	//triangle fans at top
	
	for(var vert = 0; vert <= v_lines; ++vert){
		h = vert/v_lines * height - height/2;
		for(var hor = 0; hor < h_lines; ++hor){
			cylPositionArray.push(radius * Math.cos((hor/h_lines) * 2 * Math.PI ));
			cylPositionArray.push(h);
			cylPositionArray.push(radius * Math.sin((hor/h_lines) * 2 * Math.PI ));
		}
	}

	for(var vert = 0; vert < v_lines; ++vert){
		for(var hor = 0; hor < h_lines - 1; ++hor){
			var first = (vert * (h_lines)) + hor;
            var second = first + h_lines;
			cylIndexArray.push(first);
			cylIndexArray.push(second);
			cylIndexArray.push(first + 1);
			cylIndexArray.push(first + 1);
			cylIndexArray.push(second);
			cylIndexArray.push(second + 1);
		}
		var first = (vert * (h_lines)) + (h_lines - 1);
		var second = first + h_lines;
		cylIndexArray.push(first);
		cylIndexArray.push(second);
		cylIndexArray.push(vert * (h_lines));
		cylIndexArray.push(vert * (h_lines));
		cylIndexArray.push(second);
		cylIndexArray.push(vert * h_lines + h_lines);
		
	}
	
	//top center point
	cylPositionArray.push(0.0);
	cylPositionArray.push(-height/2);
	cylPositionArray.push(0.0);
	
	//bottom center point
	cylPositionArray.push(0.0);
	cylPositionArray.push(height/2);
	cylPositionArray.push(0.0);
	
	//top fan
	for(var i = 0; i < (h_lines - 1); ++i){
		cylIndexArray.push((v_lines + 1) * h_lines);
		cylIndexArray.push(i);
		cylIndexArray.push(i + 1);
	}
	
	cylIndexArray.push((v_lines + 1) * h_lines);
	cylIndexArray.push(h_lines - 1);
	cylIndexArray.push(0);
	
	
	//bottom fan
	var adjust = v_lines * h_lines;
	for(var i = 0; i < (h_lines - 1); ++i){
		cylIndexArray.push((v_lines + 1) * h_lines + 1);
		cylIndexArray.push(adjust + i + 1);
		cylIndexArray.push(adjust + i);
	}
	
	cylIndexArray.push((v_lines + 1) * h_lines + 1);
	cylIndexArray.push(adjust + h_lines - 1);
	cylIndexArray.push(adjust);

	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylPositionArray), gl.STATIC_DRAW);
	cyl.positionBuffer.itemSize = 3;
	cyl.positionBuffer.numItems = cylPositionArray.length / 3;

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylIndexArray), gl.STATIC_DRAW);
	cyl.indexBuffer.itemSize = 1;
	cyl.indexBuffer.numItems = cylIndexArray.length;
	
	return cyl;
}

function genSphere(latitude, longitude, radius)
{
	var sphere = {};
	sphere.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphere.positionBuffer);
	sphere.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normalBuffer);
	sphere.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuffer);

	var spherePositionArray = [];
	var sphereIndexArray = [];
	var sphereNormalArray = [];
	
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
			
			sphereIndexArray.push(x);
			sphereIndexArray.push(y);
			sphereIndexArray.push(z);
	
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
	sphere.positionBuffer.itemSize = 3;
	sphere.positionBuffer.numItems = spherePositionArray.length / 3;
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormalArray), gl.STATIC_DRAW);
	sphere.normalBuffer.itemSize = 3;
	sphere.normalBuffer.numItems = sphereNormalnArray.length / 3;

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndexArray), gl.STATIC_DRAW);
	sphere.indexBuffer.itemSize = 1;
	sphere.indexBuffer.numItems = sphereIndexArray.length;
	
	return sphere;

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

	shaderProgram.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
	gl.enableVertexAttribArray(shaderProgram.vPosition);
	shaderProgram.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
	gl.enableVertexAttribArray(shaderProgram.vNormal);
	
	//locations
	shaderProgram.loc_AmbientProduct = gl.getUniformLocation(shaderProgram, "AmbientProduct");
	shaderProgram.loc_DiffuseProduct = gl.getUniformLocation(shaderProgram, "DiffuseProduct");
	shaderProgram.loc_SpecularProduct = gl.getUniformLocation(shaderProgram, "SpecularProduct");
	
	shaderProgram.loc_Eye = gl.getUniformLocation(shaderProgram, "Eye");
	shaderProgram.loc_Shininess = gl.getUniformLocation(shaderProgram, "Shininess");
	
	shaderProgram.loc_ModelView = gl.getUniformLocation(shaderProgram, "ModelView");
	shaderProgram.loc_Projection = gl.getUniformLocation(shaderProgram, "Projection");
	shaderProgram.loc_LightPosition = gl.getUniformLocation(shaderProgram, "LightPosition");
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

function init(){

	light.position  = $V([0.0, 0.0, 2.0, 1.0]);
	light.ambient   = $V([0.2, 0.2, 0.2, 1.0]);
	light.diffuse   = $V([1.0, 1.0, 1.0, 1.0]);
	light.specular  = $V([1.0, 1.0, 1.0, 1.0]);

}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspectiveMatrix = makePerspective(45, 1.0, 0.1, 1000.0);

	loadIdentity();
	mvTranslate([0.0, 0.0, -5.0]);
	
	var objectsLength = objects.length;
	for(var i = 0; i < objectsLength; ++i){
	
		var obj = objects[i];
	
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.positionBuffer);
		gl.vertexAttribPointer(shaderProgram.vPosition, obj.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.vertexAttribPointer(shaderProgram.vNormal, obj.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
		
		mvPushMatrix();
		mvTranslate(obj.translate);
		
		setObjectProperties();
		setUniforms();
	
		gl.drawElements(gl.TRIANGLES, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		mvPopMatrix();
	
	}
	

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
  
  gl.uniform4v
}

function setObjectProperties(obj){
	
	gl.uniform4f(shaderProgram.loc_AmbientProduct, light.am


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




