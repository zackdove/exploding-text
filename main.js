var ctx;


// Helper Functions

// Returns true if device has pointer/mouse (i.e. no touch)
function hasPointer(){
	var query = window.matchMedia("(hover: hover) and (pointer: fine)");
	// if (query.matches){
	// 	return true;
	// } else {
	// 	return false;
	// }
	return query.matches;
}

// Initialisation




function init() {
    // isMobile = checkMobile();
    if (hasPointer()) {
        // updateMinDist();
        // initCanv();
        // initSplashContent();
        // initParts();
        
    }
    else {
		// No pointer, so just show normal
        // setTimeout(() => {
        //     document.body.classList.remove("loading");
        // }, 500);
        // initFocusPoint();
        // initMainContent();
    }
}

window.onload = init;