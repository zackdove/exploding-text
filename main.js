var ctx;
var canvas;
let dpi = window.devicePixelRatio;
var width = window.innerWidth;
var height = window.innerHeight;
var allParts = [];
var animCenter;
document.fonts.load('3.8rem "Maison Neue"');

// Helper Functions

function getCoord(i) {
    i = i/4;
    var x = i%width;
    var y = (i-x)/width;
    return [x,y];
}


// Get dimensions of canvas, take DPI into account, without this, it will be blurry
function setCanvasDims() {
	//get CSS height
	//the + prefix casts it to an integer
	//the slice method gets rid of "px"
	let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
	height = style_height * dpi;
	//get CSS width
	let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
	width = style_width * dpi;
	//scale the canvas
	canvas.setAttribute('height', height);
	canvas.setAttribute('width', width);
}

window.onresize = function() {
	setCanvasDims();
}

// Returns true if device has pointer/mouse (i.e. no touch)
function hasPointer(){
	var query = window.matchMedia("(hover: hover) and (pointer: fine)");
	return query.matches;
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
	dx = chance.integer({min: -windowWidth/ddiv, max: windowWidth/ddiv});
    dy = chance.integer({min: -windowWidth/ddiv, max: windowWidth/ddiv});
    return {
        points: points,
        center: center,
        dx: dx,
        dy: dy,
        m: chance.floating({min:0.7,max:1.3})
    };
}

// Split image into different parts
function getParts(){
	var imageData = ctx.getImageData(0,0,canv.width,canv.height);
	var points = [];
	// Convert raw data into points
	for (var i = 0; i < imageData.data.length; i+=4) {
        if (imageData.data[i+3] > 0) {
            var c = imageData.data[i] + "," + imageData.data[i+1] + "," + imageData.data[i+2] + "," + imageData.data[i+3];
            points.push(getCoord(i));
        }
    }
	let randomIndex = Math.round(Math.random() * (point.length-1));
	animCenter = points[randomIndex];
	var parts = 50;
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
	   while (partPoints.length < numPointsPerPart) {
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
		numToProcess -= partPoints.length;
        partPoints = partPoints.map((a) => points[a]);
        var part = newPart(partPoints);
        allParts.push(part);
	}
}

function initText() {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "white";
    ctx.font="10rem Maison Neue";
    ctx.textAlign = "center";
    ctx.fillText("Plinth",width/2, height/2);
}

function init() {
    // isMobile = checkMobile();
	
    if (hasPointer()) {
        initCanvas();
		initText();
    }
    else {
		// No pointer, so just show normal, remove loading, make easy for Saul/
		// Other team
    }
}

window.onload = init;


// Animation



