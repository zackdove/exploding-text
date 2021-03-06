var ctx;
var canvas;
var dpi = 1;
var dpiMult = 1.5;
var width = window.innerWidth * dpi * dpiMult;
var height = window.innerHeight * dpi * dpiMult;
var allParts = [];
var animCenter;
var mouseX;
var mouseY;
var minDist;
var multiplier = 0.8;
var colours;
document.fonts.load('3.8rem "Maison Neue"');

// ------ Helper Functions -------

// minDist is the distance needed to shift the points
function setMinDist(){
	minDist = Math.min(width, height) * 0.05;
}

// Get coordiate from index
function getCoord(i) {
	i = i/4;
	var x = i%canvas.width;
	var y = (i-x)/canvas.width;
	return [x,y];
}

// Get font size, allows for different browser methods
function getFontSize(){
	const body = document.body;
	if (body.currentStyle){
		return body.currentStyle["fontSize"];
	} else if (document.defaultView && document.defaultView.getComputedStyle){ // Gecko & WebKit
		return document.defaultView.getComputedStyle(body, '')["fontSize"];
	}
	else {// try and get inline style
		return el.style[cssprop];
	}
}

// Get index of colour
function getColourIndex(colour){
    if (colours.indexOf(colour) < 0) {
		colours.push(colour);
	}
    return colours.indexOf(colour);
}

// Get index from coordinate
function getInd(x,y) {
	return (((y*canvas.width)+x)*4);
}

// Taken from Saul's scratcher - cheers!
function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';
	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
}

// Takes the raw image data, decrease alpha channel
function fadeImage(imgData){
	for (let i = 0; i < imgData.data.length; i += 4) {
		// imgData.data[i + 3] = imgData;      // A value
		if (imgData.data[i+3] > 0){
			// Amount must be factor of 255 (3, 5, 17)
			let amount = 5;
			imgData.data[i+3] = imgData.data[i+3] - amount;
		}
	}
	return imgData;
}

// Check is at least one single pixel is drawn
function checkDrawn(){
	var imgData = ctx.getImageData(0,0,width,height);
	for (let i = 0; i < imgData.data.length; i += 4) {
		// imgData.data[i + 3] = A value
		if (imgData.data[i+3] > 0){
			return true; 
		}
	}
	return false;
}

// Draw black text instead of white
function drawInverseText(){
	ctx.fillStyle = "black";
	ctx.font= getFontSize()+"px Maison Neue";
	ctx.textAlign = "center";
	var text = "Digital projects that cut through the noise";
	var x = (width + 15) / 2;
	var y = (height - 24) / 2;	
	wrapText(ctx, text, x, y, width*0.5, 140);
}

// Calculate euclidian distance between two points
function getDist(x1,y1,x2,y2) {
	var dx = x1 - x2;
	var dy = y1 - y2;
	return Math.sqrt((dx*dx)+(dy*dy));
}

// Get dimensions of canvas, take DPI into account, without this, it will be blurry
function setCanvasDims() {
	//get CSS height
	//the + prefix casts it to an integer
	//the slice method gets rid of "px"
	// height = style_height * dpi * 1.2;
	height  = window.innerHeight * dpi * dpiMult;
	//get CSS width
	// width = style_width * dpi * 1.2;
	width = window.innerWidth * dpi * dpiMult;
	//scale the canvas
	canvas.setAttribute('height', height);
	canvas.setAttribute('width', width);
	setMinDist();
}

// Resize
function resize(){
	initCanvas();
	initText();
	getParts();
}

// Delay for resizing, stops overloading the browser
var timeout;
window.onresize = function() {
	if (timeout) {
		clearTimeout(timeout);
	} 
	timeout = setTimeout(resize, 200);
}

// Get canvas coords of mouse
// e is event from mousemouse eventlistener
function getMouseCoords(e){
	mouseX = e.clientX * dpi * dpiMult;
	mouseY = e.clientY * dpi * dpiMult;
}

// Returns true if device has pointer/mouse (i.e. no touch)
function hasPointer(){
	var query = window.matchMedia("(hover: hover) and (pointer: fine)");
	return query.matches;
}



// ------- Animation -------

// Might need to use a callback to force moveParts after getMouseCoords
function handleMove(e){
	getMouseCoords(e);
	moveParts();
}

// Move the individual parts of the text
function moveParts() {
	var persistOldData = false;
	var imgData
	if (persistOldData){
		imgData = fadeImage(ctx.getImageData(0,0,width,height));
	} else {
		imgData = ctx.createImageData(width, height);
	}
	for (var i = 0; i < allParts.length; i++) {
		var curPart = allParts[i];
		// This section controls moving the parts over time, comment out for stationary
		// Change multiplier to move more
		var t_multiplier;
		if (multiplier > 4.8){
			multiplier = 0.8;
		}
		if (multiplier > 2.8){
			t_multiplier = 4.8 - multiplier + 0.8;
		} else {
			t_multiplier = multiplier;
		}
		multiplier=multiplier+0.0000002;
		var curDist = getDist(curPart.center[0],curPart.center[1],mouseX,mouseY) * curPart.m * (1/t_multiplier);
		// If within minDist, move them away
		if (curDist <= minDist) {
			var distMult = 1 - (curDist/minDist);
			var xDelta = Math.floor(curPart.dx*distMult);
			var yDelta = Math.floor(curPart.dy*distMult);
			// Draw new location in white
			for (var j = 0; j < curPart.points.length; j++) {
				var curPoint = curPart.points[j];
				var newX = curPoint[0][0] + xDelta;
				var newY = curPoint[0][1] + yDelta;
				if (newX > 0 && newX < width && newY > 0 && newY < height) {
					var ind = getInd(newX,newY);
					// Set colour here, RGBA order
					var colour = colours[curPoint[1]];
					imgData.data[ind]   = colour[0];
					imgData.data[ind+1] = colour[1];
					imgData.data[ind+2] = colour[2];
					imgData.data[ind+3] = colour[3];
				}
				// Draw the old location in black
				var drawOldLocation = false;
				if (drawOldLocation){
					var ind = getInd(curPoint[0][0], curPoint[0][1]);
					imgData.data[ind]   = 0;
					imgData.data[ind+1] = 0;
					imgData.data[ind+2] = 0;
					imgData.data[ind+3] = 255;
				}
			}
			allParts[i].updated = false;
		}
		// Else move them back
		else {
			for (var j = 0; j < curPart.points.length; j++) {
				var curPoint = curPart.points[j];
				var ind = getInd(curPoint[0][0],curPoint[0][1]);
				// Set colour here, RGBA order
				var colour = colours[curPoint[1]];
				imgData.data[ind]   = colour[0];
				imgData.data[ind+1] = colour[1];
				imgData.data[ind+2] = colour[2];
				imgData.data[ind+3] = colour[3];
			}
			if (!allParts[i].updated) {
				var ddiv = 3.5;
				let min = -width/ddiv;
				let max = width/ddiv;
				if (Math.random()>0.5) {
					allParts[i].dx = Math.round(Math.random() * (max-min) + min);
					allParts[i].dy = Math.round(Math.random() * (max-min) + min);
				}
				else {
					allParts[i].dx = Math.round(Math.random() * (max-min) + min);
					allParts[i].dy = Math.round(Math.random() * (max-min) + min);
				}
				allParts[i].updated = true;
			}
		}
	}
	// ctx.clearRect(0,0,width,height);
	ctx.putImageData(imgData,0,0);
}



// Initialisation

// Initialise the canvas, note canv.width != canv.style.width
function initCanvas() {
	canvas = document.getElementById("canvas");
	ctx  = canvas.getContext("2d");
	allParts = [];
	setCanvasDims();
}

// Convert points to part which is made of points, center, a random offset in x and y, plus random speed m
function newPart(points) {
	var center = [0,0,];
	for (var i = 0; i < points.length; i++) {
		center[0] += points[i][0][0];
		center[1] += points[i][0][1];
	}
	center[0] = Math.round(center[0]/points.length);
	center[1] = Math.round(center[1]/points.length);
	var dx;
	var dy;
	var ddiv = 3.5;
	let min = -width/ddiv;
	let max = width/ddiv;
	dx = Math.round(Math.random() * (max-min) + min);
	dy = Math.round(Math.random() * (max-min) + min);
	return {
		points: points,
		center: center,
		dx: dx,
		dy: dy,
		m: Math.random() * (1.3-0.7) + 0.7
	};
}

// Split image into small, random parts
function getParts(){
	if (checkDrawn()){
		allParts = [];
		colours = [];
		var imageData = ctx.getImageData(0,0,width,height);
		var points = [];
		// Convert raw data into points
		for (var i = 0; i < imageData.data.length; i+=4) {
			if (imageData.data[i+3] > 0) {
				var colour = imageData.data[i] + "," + imageData.data[i+1] + "," + imageData.data[i+2] + "," + imageData.data[i+3];
				points.push([getCoord(i), getColourIndex(colour)]);
			}
		}
		let randomIndex = Math.round(Math.random() * (points.length-1));
		animCenter = points[randomIndex];
		var parts = 100;
		var pointsPerPart = points.length/parts;
		var coordDict = {};
		// Split coords into dictionary so we can index rows and columns
		for (var i = 0; i < points.length; i++) {
			var x = points[i][0][0];
			var y = points[i][0][1];
			if (!coordDict[x])    coordDict[x]    = {};
			if (!coordDict[x][y]) coordDict[x][y] = [];
			coordDict[x][y] = i;
		}
		var pointsRemaining = points.length;
		while (pointsRemaining > 0){
			var xCoords = Object.keys(coordDict);
			// Get random starting position
			var startX = xCoords[Math.round(Math.random() * (xCoords.length-1))];
			var yCoords = Object.keys(coordDict[startX]);
			if (yCoords.length < 1) {
				delete coordDict[startX];
				continue;
			}
			var startY = yCoords[Math.round(Math.random() * (yCoords.length-1))];
			var partPoints = [];
			partPoints.push(coordDict[startX][startY]);
			// Delete these points so they wont be used again
			delete coordDict[startX][startY];
			// For this starting point, get random nearby points until reached necessary number of points
			// In practice, runs out of neighbors before can reach suitable number
			while (partPoints.length < pointsPerPart) {
				var curX = points[partPoints[partPoints.length-1]][0][0];
				var curY = points[partPoints[partPoints.length-1]][0][1];
				var neighbors = [];
				// Get all 8 adjacent points
				for (var diffX = -1; diffX <= 1; diffX++) {
					for (var diffY = -1; diffY <= 1; diffY++) {
						if (diffX == 0 && diffY == 0) continue;
						var newX = curX + diffX;
						var newY = curY + diffY;
						if (coordDict[newX] && coordDict[newX][newY]) {
							neighbors.push([newX,newY,coordDict[newX][newY]]);
							continue;
						}
					}
				}
				if (neighbors.length > 0) {
					var winningNeighbor = neighbors[Math.round(Math.random() * (neighbors.length-1))];
					// [2] refers to the coordDict elem
					partPoints.push(winningNeighbor[2]);
					// [0] and [1] refer to newX and newY
					delete coordDict[winningNeighbor[0]][winningNeighbor[1]];
				}
				else break;
			}
			pointsRemaining -= partPoints.length;
			partPoints = partPoints.map((a) => points[a]);
			var part = newPart(partPoints);
			allParts.push(part);
		}
		document.addEventListener("mousemove", handleMove);
		setInterval(moveParts, 10);
	} else {
		// If not drawn, retry after timeout
		setTimeout(getParts, 10);
	}
	for (var i = 0; i < colours.length; i++) {
            colours[i] = colours[i].split(',').map(function(item) {
                return parseInt(item, 10);
            });
        }
}



// Draw the text to the screen
function initText() {
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = "white";
	var fontSize = getFontSize().slice(0,-2) * dpi * dpiMult;
	ctx.font= fontSize + "px Maison Neue";
	ctx.textAlign = "center";
	var text = "Digital projects that cut through the noise";
	var x = (width + 15) / 2;
	var y = (height - 24) / 2;	
	wrapText(ctx, text, x, y, width*0.5, fontSize);
}

function init() {
	// isMobile = checkMobile();
	if (hasPointer()) {
		initCanvas();
		initText();
		getParts();
	}
	else {
		// No pointer, so just show normal, remove loading, make easy for Saul/
		// Other team
	}
}

window.onload = init;