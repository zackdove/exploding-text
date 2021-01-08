var ctx;
let dpi = window.devicePixelRatio;
var width = window.innerWidth;
var height = window.innerHeight;
document.fonts.load('3.8rem "Maison Neue"');

// Helper Functions

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