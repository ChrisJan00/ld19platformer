function draw(dt) {
    graphics.draw(dt);
}

var graphics = new( function() {
    this.init = function() {
	graphics.currentCanvas = document.getElementById("canvas1");
	graphics.currentContext = graphics.currentCanvas.getContext("2d");
	graphics.canvasWidth = graphics.currentCanvas.width;
	graphics.canvasHeight = graphics.currentCanvas.height;
    }
    
    this.draw = function(dt) {
	var dts = dt/1000;
    
	if (assets.updateAnimations)
	    updateAnimations();

	if ((player.oldx>=0) && (player.oldx+player.width<=graphics.canvasWidth) && (player.oldy>=0) && (player.oldy+player.height<=graphics.canvasHeight))
	    graphics.currentContext.drawImage(assets.bgCanvas, player.oldx, player.oldy, player.width, player.height, player.oldx, player.oldy, player.width, player.height); 
    
	// wait!  this should not be stored in the player structure!
	player.oldx = Math.floor(player.x+player.speedRight*dts + 0.5);
	player.oldy = Math.floor(player.y-player.speedUp*dts + 0.5);
    
	if ((player.oldx>=0) && (player.oldx+player.width<=graphics.canvasWidth) && (player.oldy>=0) && (player.oldy+player.height<=graphics.canvasHeight)) {
	    graphics.currentContext.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, player.oldx, player.oldy, player.width, player.height);
	}
    
    }
})

function updateAnimations() {

    // background
    var bgContext = assets.bgCanvas.getContext('2d');
    // foreground
    var canvas = graphics.currentCanvas;
    var fgContext = graphics.currentContext;
    
    // objects
    for (var ii=0; ii<assets.objects.length; ii++) {
	var oldFrame = assets.objects[ii].oldFrame;
	var frame = assets.objects[ii].currentFrame;
	if (oldFrame == frame)
	    continue;
	if (oldFrame >= 0) {
	    var box = assets.objects[ii].boundingBox[oldFrame];
	    if ((box.w > 0) && (box.h > 0)) {
		bgContext.drawImage(assets.baseCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
		fgContext.drawImage(assets.baseCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	    }
	}
	assets.objects[ii].oldFrame = frame;
	var objectCanvas = assets.objects[ii].frames[frame];
	var box = assets.objects[ii].boundingBox[frame];
	if ((box.w > 0) && (box.h > 0)) {
	    bgContext.drawImage(objectCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	    fgContext.drawImage(objectCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	}
    }
	
    assets.updateAnimations = false;
}