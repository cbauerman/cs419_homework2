var gl; // A global variable for the WebGL context
var vertexPositionAttribute;
var shaderProgram;

var spherepositionBuffer;
var sphereindexBuffer;

var objects = [];
var light = {};
var camera = {};

var canvas;

var centerObj;
var arm1Obj;
var arm2Obj;
var sphere1Obj;
var sphere2Obj;

var canvasX = 0.0;
var canvasY = 0.0;

var screenX = 768;
var screenY = 768;

//matricies
var perspectiveMatrix
var modelViewMatrix;

function run(){
	drawScene();
	animateScene();
}

function start() {

	init();
		
	centerObj = genSphere(0.5, 30, 30);
	centerObj.ambient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
	centerObj.diffuse = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	centerObj.specular = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	centerObj.shininess = 400.0; 
	centerObj.transform = mat4.create();
	mat4.identity(centerObj.transform);
	
	centerObj.name = "center";
	
	objects.push(centerObj);
	
	arm1Obj = genCylinder(6, 0.5, 30, 30);
	arm1Obj.ambient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
	arm1Obj.diffuse = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	arm1Obj.specular = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	arm1Obj.shininess = 400.0;
	arm1Obj.transform = mat4.create();
	mat4.identity(arm1Obj.transform);
	
	mat4.rotateZ(arm1Obj.transform, arm1Obj.transform, -Math.PI/2);
	
	arm1Obj.name = "arm1";
	
	arm1Obj.pred = centerObj;
	arm1Obj.pred_ang = 0.0;
	arm1Obj.pred_dis = vec3.fromValues(0.0, 0.0, 0.0);
	
	objects.push(arm1Obj);
	
	sphere1Obj = genSphere(.5, 30, 30);
	sphere1Obj.ambient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
	sphere1Obj.diffuse = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	sphere1Obj.specular = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	sphere1Obj.shininess = 400.0;
	sphere1Obj.transform = mat4.create();
	mat4.identity(sphere1Obj.transform);
	
	sphere1Obj.name = "sphere1";
	
	sphere1Obj.pred = arm1Obj;
	sphere1Obj.pred_ang = 0.0;
	sphere1Obj.pred_dis = vec3.fromValues(6.0, 0.0, 0.0);
	
	objects.push(sphere1Obj);
	
	arm2Obj = genCylinder(6, 0.5, 30, 30);
	arm2Obj.ambient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
	arm2Obj.diffuse = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	arm2Obj.specular = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	arm2Obj.shininess = 400.0;
	arm2Obj.transform = mat4.create();
	mat4.identity(arm2Obj.transform);
	
	mat4.rotateZ(arm2Obj.transform, arm2Obj.transform, -Math.PI/2);
	
	arm2Obj.name = "arm2";
	
	arm2Obj.pred = arm1Obj;
	arm2Obj.pred_ang = 0.0;
	arm2Obj.pred_dis = vec3.fromValues(6.0, 0.0, 0.0);
	
	objects.push(arm2Obj);
	
	sphere2Obj = genSphere(.5, 30, 30);
	sphere2Obj.ambient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
	sphere2Obj.diffuse = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	sphere2Obj.specular = vec4.fromValues(1.0, 0.5, 0.0, 1.0);
	sphere2Obj.shininess = 400.0;
	sphere2Obj.transform = mat4.create();
	mat4.identity(sphere2Obj.transform);
	
	sphere2Obj.name = "sphere2";
	
	sphere2Obj.pred = arm2Obj;
	sphere2Obj.pred_ang = 0.0;
	sphere2Obj.pred_dis = vec3.fromValues(6.0, 0.0, 0.0);
	
	objects.push(sphere2Obj);
	
	//event listeners
	
	var el1 = document.getElementById("angle1box");
	var el2 = document.getElementById("angle2box");
	
	el1.addEventListener("input", function(){arm1Obj.pred_ang = el1.value * (Math.PI / 180);}, false);
	el2.addEventListener("input", function(){arm2Obj.pred_ang = el2.value * (Math.PI / 180);}, false);
	
	canvas.addEventListener("click", relMouseCoords, false);
	
	HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
	
	setInterval(run, 15);
}

function init(){

	canvas = document.getElementById("glcanvas");
	
	gl = initWebGL(canvas);      // Initialize the GL context

	// Only continue if WebGL is available and working

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
		gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
		gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	}


	initShaders();

	camera.eye = vec3.fromValues(0.0, 0.0, 25.0);
	camera.center = vec3.fromValues(0.0, 0.0, 0.0);
	camera.up = vec3.fromValues(0.0, 1.0, 0.0);


	perspectiveMatrix = mat4.create();
	modelViewMatrix = mat4.create();

	mat4.perspective(perspectiveMatrix, 45, 1.0, 0.1, 1000.0);
	mat4.lookAt(modelViewMatrix, camera.eye, camera.center, camera.up);
	
	light.position  = vec4.fromValues(0.0, 0.0, 35.0, 1.0);
	light.ambient   = vec4.fromValues(0.2, 0.2, 0.2, 1.0);
	light.diffuse   = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	light.specular  = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

}

function genCylinder(height, radius, v_lines, h_lines){
	var cyl = {};
	cyl.positionBuffer = gl.createBuffer();
	cyl.normalBuffer = gl.createBuffer();
	cyl.indexBuffer = gl.createBuffer();
	

	var cylPositionArray = [];
	var cylNormalArray = [];
	var cylIndexArray = [];
	

	var h;
	var normalX;
	var normalZ;
	
	//body of cylinder
	for(var vert = 0; vert <= v_lines; ++vert){
		h = vert/v_lines * height;
		for(var hor = 0; hor < h_lines; ++hor){
			normalX = Math.cos((hor/h_lines) * 2 * Math.PI );
			normalZ = Math.sin((hor/h_lines) * 2 * Math.PI );
			
			cylPositionArray.push(radius * normalX);
			cylPositionArray.push(h);
			cylPositionArray.push(radius * normalZ);
			
			cylNormalArray.push(normalX);
			cylNormalArray.push(0.0);
			cylNormalArray.push(normalZ);
			
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
	cylPositionArray.push(0.0);
	cylPositionArray.push(0.0);
	
	cylNormalArray.push(0.0);
	cylNormalArray.push(1.0);
	cylNormalArray.push(0.0);
	
	//bottom center point
	cylPositionArray.push(0.0);
	cylPositionArray.push(height);
	cylPositionArray.push(0.0);
	
	cylNormalArray.push(0.0);
	cylNormalArray.push(-1.0);
	cylNormalArray.push(0.0);
	
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

	gl.bindBuffer(gl.ARRAY_BUFFER, cyl.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylPositionArray), gl.STATIC_DRAW);
	cyl.positionBuffer.itemSize = 3;
	cyl.positionBuffer.numItems = cylPositionArray.length / 3;

	gl.bindBuffer(gl.ARRAY_BUFFER, cyl.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylNormalArray), gl.STATIC_DRAW);
	cyl.normalBuffer.itemSize = 3;
	cyl.normalBuffer.numItems = cylNormalArray.length / 3;
	
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cyl.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylIndexArray), gl.STATIC_DRAW);
	cyl.indexBuffer.itemSize = 1;
	cyl.indexBuffer.numItems = cylIndexArray.length;
	
	return cyl;
}

function genSphere(radius, latitude, longitude){
	var sphere = {};
	sphere.positionBuffer = gl.createBuffer();
	sphere.normalBuffer = gl.createBuffer();
	sphere.indexBuffer = gl.createBuffer();
	
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
			
			sphereNormalArray.push(x);
			sphereNormalArray.push(y);
			sphereNormalArray.push(z);
	
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
		
	gl.bindBuffer(gl.ARRAY_BUFFER, sphere.positionBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spherePositionArray), gl.STATIC_DRAW);
	sphere.positionBuffer.itemSize = 3;
	sphere.positionBuffer.numItems = spherePositionArray.length / 3;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormalArray), gl.STATIC_DRAW);
	sphere.normalBuffer.itemSize = 3;
	sphere.normalBuffer.numItems = sphereNormalArray.length / 3;

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuffer);
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
	shaderProgram.loc_TransformP = gl.getUniformLocation(shaderProgram, "TransformP");
	shaderProgram.loc_TransformN = gl.getUniformLocation(shaderProgram, "TransformN");
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

function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var objectsLength = objects.length;
	for(var i = 0; i < objectsLength; ++i){
	
		var obj = objects[i];
	
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.positionBuffer);
		gl.vertexAttribPointer(shaderProgram.vPosition, obj.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.vertexAttribPointer(shaderProgram.vNormal, obj.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
				
		setObjectProperties(obj);
		setUniforms();
	
		gl.drawElements(gl.TRIANGLES, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			
	}
}

function animateScene(){

	var el1 = document.getElementById("angle1box");
	var el2 = document.getElementById("angle2box");
	
	el1.value = arm1Obj.pred_ang * (180 / Math.PI);
	el2.value = arm2Obj.pred_ang * (180 / Math.PI);
	
	jacob_1(arm1Obj, arm2Obj, canvasX, canvasY, 0);
	

}

function setObjectProperties(obj){
	
	var result = vec4.create();
	
	vec4.multiply(result, light.ambient, obj.ambient);
	gl.uniform4fv(shaderProgram.loc_AmbientProduct, result);
	
	vec4.multiply(result, light.diffuse, obj.diffuse);
	gl.uniform4fv(shaderProgram.loc_DiffuseProduct, result);
	
	vec4.multiply(result, light.specular, obj.specular);
	gl.uniform4fv(shaderProgram.loc_SpecularProduct, result);

	gl.uniform1f(shaderProgram.loc_Shininess, obj.shininess);
	
	result = mat4.create();
	mat4.identity(result);
	
	createPredChain(result, obj);
	
	var result_in = mat4.create();
	mat4.invert(result_in, result);
	var fin = mat4.create();
	mat4.identity(fin);
	
	mat4.multiply(fin, result, fin);
	mat4.multiply(fin, result_in, fin);
	mat4.multiply(fin, obj.transform, fin);
	mat4.multiply(fin, result, fin);
	
	gl.uniformMatrix4fv(shaderProgram.loc_TransformP, false, fin);
	
	mat4.invert(result, result);
	mat4.transpose(result, result);
	
	gl.uniformMatrix4fv(shaderProgram.loc_TransformN, false, result);

	
}

function setUniforms(){

	gl.uniformMatrix4fv(shaderProgram.loc_ModelView, false, modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.loc_Projection, false, perspectiveMatrix);
	
	gl.uniform4fv(shaderProgram.loc_LightPosition, light.position);
	gl.uniform3fv(shaderProgram.loc_Eye, camera.eye);
	
}

function hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}

function createPredChain(out, obj){

	var previous = mat4.create();
	mat4.identity(previous);

	if(obj.hasOwnProperty('pred')){
	
			
		mat4.translate(out, out, obj.pred_dis);
		mat4.rotateZ(out, out, obj.pred_ang);		
	
		createPredChain(previous, obj.pred);
	
		mat4.multiply(out, previous, out);
		
	} else {
		out = previous;
	}
	
}

function jacob_1(obj1, obj2, x, y, limit){

	//check to see how far we have iterated
	if(limit > 60){
		return false;
	}
	
	++limit;

	//convert to degrees
	
	var ang1 = obj1.pred_ang * (180/ Math.PI) ;
	var ang2 = obj2.pred_ang * (180/ Math.PI);
	
	
	//compute x approx and y approx

	var x_a = X(6, ang1, ang2);
	var y_a = Y(6, ang1, ang2);

	//check to see if we are done
	
	var x_diff = x - x_a;
	var y_diff = y - y_a;


	var e = .05;
	
	if(Math.abs(x_diff) < e &&  Math.abs(y_diff) < e){
		return true;
	}
	
	var e2 = .0000005;
	//otherwise compute our partial derivatives using central difference 
	
	var x_theta1 = (X(6,ang1 + e2,ang2) - X(6,ang1 - e2,ang2))/(2 * e2);
	var x_theta2 = (X(6,ang1,ang2 + e2) - X(6,ang1,ang2 - e2))/(2 * e2);
	var y_theta1 = (Y(6,ang1 + e2,ang2) - Y(6,ang1 - e2,ang2))/(2 * e2);
	var y_theta2 = (Y(6,ang1,ang2 + e2) - Y(6,ang1,ang2 - e2))/(2 * e2);
	
	// var x_theta1 = (X(6,ang1 + e2,ang2) - X(6,ang1, ang2))/(e2);
	// var x_theta2 = (X(6,ang1,ang2 + e2) - X(6,ang1, ang2))/(e2);
	// var y_theta1 = (Y(6,ang1 + e2,ang2) - Y(6,ang1, ang2))/(e2);
	// var y_theta2 = (Y(6,ang1,ang2 + e2) - Y(6,ang1, ang2))/(e2);
	
	
	// solve systems
	
	var d_theta1 = (x_diff * x_theta1 + y_diff * y_theta1)/(x_theta1 * x_theta1 + y_theta1 * y_theta1)
	var d_theta2 = (x_diff * x_theta2 + y_diff * y_theta2)/(x_theta2 * x_theta2 + y_theta2 * y_theta2)

	if(Number.isNaN(d_theta1)){
		d_theta1 = 0;
	}
	
	if(Number.isNaN(d_theta2)){
		d_theta2 = 0;
	}
	
	
	
	obj1.pred_ang += (Math.PI/180) * d_theta1;
	obj2.pred_ang += (Math.PI/180) * d_theta2;
	
	obj1.pred_ang = obj1.pred_ang % (2 * Math.PI);
	obj2.pred_ang = obj2.pred_ang % (2 * Math.PI);
	
	
	drawScene();

	return jacob_1(obj1, obj2, x, y, limit);


}

function X(r, ang1, ang2){

	return r * Math.cos((Math.PI/180) * ang1) + r * Math.cos((Math.PI/180) * (ang2 + ang1)); 
}

function Y(r, ang1, ang2){

	return r * Math.sin((Math.PI/180) * ang1) + r * Math.sin((Math.PI/180) * (ang2 + ang1)); 
}

function relMouseCoords(event){


	if (event.offsetX !== undefined && event.offsetY !== undefined) { 
		canvasX = event.offsetX;
		canvasY = event.offsetY;
	} else {

		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var currentElement = this;

		do{
			totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
			totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
		}
		while(currentElement = currentElement.offsetParent)

		canvasX = event.pageX - totalOffsetX;
		canvasY = event.pageY - totalOffsetY;
		
	}
	
	//transform mouse coordinates to range 1 to -1
	canvasX = 2.0 * (canvasX/screenX) - 1.0;
	canvasY = 1.0 -  2.0 * (canvasY/screenY);
	
	
	
	var inverse = mat4.create();
	
	mat4.multiply(inverse, perspectiveMatrix, modelViewMatrix);
	
	mat4.invert(inverse, inverse);
	
	var coords1 = vec4.create();
	var coords2 = vec4.create();
	
	vec4.transformMat4(coords1, vec4.fromValues(canvasX, canvasY, -1.0, 1.0), inverse);
	vec4.transformMat4(coords2, vec4.fromValues(canvasX, canvasY, 1.0, 1.0), inverse);
	
	var point_near = vec3.fromValues(coords1[0]/coords1[3], coords1[1]/coords1[3], coords1[2]/coords1[3]);
	var point_far = vec3.fromValues(coords2[0]/coords2[3], coords2[1]/coords2[3], coords2[2]/coords2[3]);
	var v = vec3.create();
	
	//create vector
	vec3.sub(v, point_far, point_near);
	vec3.normalize(v, v);
	
	//plane normal
	var n = vec3.fromValues(0, 0, -1);
	
	var t = -vec3.dot(n, point_near)/vec3.dot(v, n);

	vec3.scale(v, v, t);
	
	vec3.add(v, v, point_near)
	
	canvasX = v[0];
	canvasY = v[1];
	
	var el1 = document.getElementById("canvasx");
	var el2 = document.getElementById("canvasy");
	el1.innerHTML = canvasX;
	el2.innerHTML = canvasY;
	

    return {x:canvasX, y:canvasY}
}


