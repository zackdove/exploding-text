var ctx;
var width = window.innerWidth,
  height = window.innerHeight;
document.fonts.load('3.8rem "Maison Neue"');
// Helper Functions



window.onresize = function() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
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
    canvas.width  = width;
    canvas.height = height;
}



function initText() {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "white";
    ctx.font="10rem Maison Neue";
    ctx.textAlign = "center";
    ctx.fillText("Plinth",width/2, (height/2));
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