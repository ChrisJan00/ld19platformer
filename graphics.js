function draw(dt) {
    graphics.draw(dt);
}

var graphics = new( function() {
    this.animationsNeedUpdate = true;
    this.playerInterpolatedX = 0;
    this.playerInterpolatedY = 0;
    
    this.init = function() {
	graphics.currentCanvas = document.getElementById("canvas1");
	graphics.currentContext = graphics.currentCanvas.getContext("2d");
	graphics.canvasWidth = graphics.currentCanvas.width;
	graphics.canvasHeight = graphics.currentCanvas.height;
	
	graphics.playerInterpolatedX = player.x;
	graphics.playerInterpolatedY = player.y;
    }
    
    this.draw = function(dt) {
	var dts = dt/1000;
    
	graphics.updateAnimations();

	if ((graphics.playerInterpolatedX >=0) && (graphics.playerInterpolatedX+player.width<=graphics.canvasWidth) && (graphics.playerInterpolatedY>=0) && (graphics.playerInterpolatedY+player.height<=graphics.canvasHeight))
	    graphics.currentContext.drawImage(assets.bgCanvas, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height); 

	graphics.playerInterpolatedX = Math.floor(player.x+player.speedRight*dts + 0.5);
	graphics.playerInterpolatedY = Math.floor(player.y-player.speedUp*dts + 0.5);
    
	if ((graphics.playerInterpolatedX>=0) && (graphics.playerInterpolatedX+player.width<=graphics.canvasWidth) && (graphics.playerInterpolatedY>=0) && (graphics.playerInterpolatedY+player.height<=graphics.canvasHeight)) {
	    graphics.currentContext.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height);
	}
    
    }

    this.paintBackground = function() {
	graphics.currentContext.drawImage(assets.bgCanvas,0,0);
    }
    
    this.setUpdateAnimations = function() {
	graphics.animationsNeedUpdate = true;
    }

    this.updateAnimations = function() {
	if (!graphics.animationsNeedUpdate)
	    return;
	    
	var bgContext = assets.bgCanvas.getContext('2d');
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
	
// 	assets.updateAnimations = false;
	graphics.animationsNeedUpdate = false;
    }
})
