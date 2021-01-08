var ctx;
var width = window.innerWidth,
  height = window.innerHeight;



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

function initCanv() {
    canv = document.getElementById("canvas");
    ctx  = canv.getContext("2d");
    canv.width  = width;
    canv.height = height;
}

function init() {
    // isMobile = checkMobile();
    if (hasPointer()) {
        initCanvas();
    }
    else {
		// No pointer, so just show normal, remove loading, make easy for Saul/
		// Other team
    }
}

window.onload = init;