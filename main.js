var ctx;
var canvas;
let dpi = window.devicePixelRatio;
var width = window.innerWidth;
var height = window.innerHeight;
var allParts = [];
var animCenter;
var mouseX;
var mouseY;
var minDist;
var multiplier = 2;
document.fonts.load('3.8rem "Maison Neue"');

// Helper Functions

function setMinDist(){
	minDist = Math.min(width, height) * 0.1;
}

function getCoord(i) {
	i = i/4;
	var x = i%width;
	var y = (i-x)/width;
	return [x,y];
}

function getInd(x,y) {
	return (((y*width)+x)*4);
}

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
	let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
	height = style_height * dpi * 1.2;
	//get CSS width
	let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
	width = style_width * dpi * 1.2;
	//scale the canvas
	canvas.setAttribute('height', height);
	canvas.setAttribute('width', width);
	setMinDist();
}

// Get canvas coords of mouse
// e is event from mousemouse eventlistener
function getMouseCoords(e){
	mouseX = e.clientX * dpi * 1.2;
	mouseY = e.clientY * dpi * 1.2;
}

window.onresize = function() {
	setCanvasDims();
}

// Returns true if device has pointer/mouse (i.e. no touch)
function hasPointer(){
	var query = window.matchMedia("(hover: hover) and (pointer: fine)");
	return query.matches;
}

// Animation

// Might need to use a callback to force moveParts after getMouseCoords
function handleMove(e){
	getMouseCoords(e);
	moveParts();
}

// Move the individual parts of the text
function moveParts() {
	var imgData = ctx.createImageData(width, height);
	for (var i = 0; i < allParts.length; i++) {
		var curPart = allParts[i];
		// Change multiplier to move more
		var t_multiplier;
		if (multiplier > 2.9){
			multiplier = 2.3;
		}
		if (multiplier > 2.6){
			t_multiplier = 2.9 - multiplier + 2.3;
		} else {
			t_multiplier = multiplier;
		}
		multiplier=multiplier+0.0000001;
		var curDist = getDist(curPart.center[0],curPart.center[1],mouseX,mouseY) * curPart.m * (1/t_multiplier);
		if (curDist <= minDist) {
			var distMult = 1 - (curDist/minDist);
			var xDelta = Math.floor(curPart.dx*distMult);
			var yDelta = Math.floor(curPart.dy*distMult);
			
			for (var j = 0; j < curPart.points.length; j++) {
				var curPoint = curPart.points[j];
				var newX = curPoint[0] + xDelta;
				var newY = curPoint[1] + yDelta;
				
				if (newX > 0 && newX < width && newY > 0 && newY < height) {
					var ind = getInd(newX,newY);
					// Set colour here, RGBA order
					imgData.data[ind]   = 255;
					imgData.data[ind+1] = 255;
					imgData.data[ind+2] = 255;
					imgData.data[ind+3] = 255;
				}
			}
			allParts[i].updated = false;
		}
		else {
			for (var j = 0; j < curPart.points.length; j++) {
				var curPoint = curPart.points[j];
				var ind = getInd(curPoint[0],curPoint[1]);
				// Set colour here, RGBA order
				imgData.data[ind]   = 255;
				imgData.data[ind+1] = 255;
				imgData.data[ind+2] = 255;
				imgData.data[ind+3] = 255;
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
	setCanvasDims();
}

// Convert points to part which is made of points, center, a random offset in x and y, plus random speed m
function newPart(points) {
	var center = [0,0,];
	for (var i = 0; i < points.length; i++) {
		center[0] += points[i][0];
		center[1] += points[i][1];
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
	var imageData = ctx.getImageData(0,0,width,height);
	var points = [];
	// Convert raw data into points
	for (var i = 0; i < imageData.data.length; i+=4) {
		if (imageData.data[i+3] > 0) {
			var c = imageData.data[i] + "," + imageData.data[i+1] + "," + imageData.data[i+2] + "," + imageData.data[i+3];
			points.push(getCoord(i));
		}
	}
	let randomIndex = Math.round(Math.random() * (points.length-1));
	animCenter = points[randomIndex];
	var parts = 25;
	var pointsPerPart = points.length/parts;
	var coordDict = {};
	// Split coords into dictionary so we can index rows and columns
	for (var i = 0; i < points.length; i++) {
		var x = points[i][0],y = points[i][1];
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
			var curX = points[partPoints[partPoints.length-1]][0];
			var curY = points[partPoints[partPoints.length-1]][1];
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
}

function initText() {
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = "white";
	ctx.font="140px Maison Neue";
	ctx.textAlign = "center";
	var text = "Digital projects that cut through the noise";
	var x = (width + 15) / 2;
	var y = (height - 24) / 2;	
	wrapText(ctx, text, x, y, width*0.5, 140);
	// ctx.fillText("Digital projects that cut through the noise",width/2, height/2);
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




